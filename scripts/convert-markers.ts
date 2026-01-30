import fs from 'fs/promises';
import path from 'path';
import { TMarkerFeatureProperties } from '@/types/marker-feature';
import { convertToLngLat } from '../lib/convert';
import { MapMetadata, MapMetadataRecord } from '@/types/map-metadata';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { MarkerSource } from '@/types/marker-source';

const publicDir = path.resolve(__dirname, '../public');
const dataDir = path.resolve(__dirname, '../app/data');
const markerMetadataPath = path.resolve(__dirname, '../public/meta.json');
const mapMetadataPath = path.resolve(__dirname, '../app/data/maps.json');

type Popups = Record<string, CategoryPayloads>;
type CategoryPayloads = Record<string, ItemPayload[]>;
type ItemPayload = { title: string; subtitle?: string };
type DeferredMarker = {
    marker: MarkerSource;
    category: string;
    meta: MetaEntry;
};

type MetaEntry = {
    category: string;
    path: string;
    anchor?: 'bottom' | 'center';
    icon?: string;
    title?: string;
    subtitle?: string;
};

async function loadMarkerMetadata(): Promise<MetaEntry[]> {
    return JSON.parse(await fs.readFile(markerMetadataPath, 'utf8'));
}

async function loadMarkersByCategory(
    entry: MetaEntry
): Promise<MarkerSource[]> {
    return JSON.parse(
        await fs.readFile(path.join(publicDir, entry.path), 'utf8')
    );
}

/** Retrieve (cached) metdata for each map. */
let cachedMapJson: MapMetadataRecord | null = null;
async function getMapMetadata(map: string): Promise<MapMetadata> {
    if (!cachedMapJson) {
        const raw = await fs.readFile(mapMetadataPath, 'utf8');
        cachedMapJson = JSON.parse(raw);
        if (!cachedMapJson) {
            throw new Error(`Missing maps.json in /app/data`);
        }
    }
    return cachedMapJson[map];
}

export async function processDirectMarkers(
    markerSource: MarkerSource[],
    entry: MetaEntry,
    features: Record<string, TMarkerFeatureProperties>,
    popups: Popups
) {
    for (const [index, marker] of markerSource.entries()) {
        if (
            marker.foreignId ||
            marker.x == null ||
            marker.y == null ||
            !marker.map
        )
            continue;
        const mapMetadata = await getMapMetadata(marker.map);
        const [lng, lat] = convertToLngLat(mapMetadata, marker.x, marker.y);
        const id = marker.id?.trim() || `${entry.category}-${index}`;
        const icon = marker.icon?.trim() || entry.icon || 'default-marker';
        const anchor = entry.anchor ? entry.anchor : 'bottom';
        features[id] = {
            id,
            map: marker.map,
            lng,
            lat,
            icon,
            anchor,
            categories: [entry.category],
        };
        if (!popups[id]) popups[id] = {};
        if (!popups[id][entry.category]) popups[id][entry.category] = [];
        const title = marker.title?.trim() || entry.title || '';
        const subtitle = marker.subtitle?.trim() || entry.subtitle || '';
        popups[id][entry.category].push({ title, subtitle });
    }
}

function processDeferredMarkers(
    deferred: { marker: MarkerSource; category: string; meta: MetaEntry }[],
    popups: Popups,
    features: Record<string, TMarkerFeatureProperties>
) {
    for (const { marker, category, meta } of deferred) {
        const targetId = marker.foreignId!.toLowerCase();
        if (!popups[targetId]) {
            console.error(`foreignId "${targetId}" not found!`);
            continue;
        }
        const title = marker.title || meta.title || '';
        const subtitle = marker.subtitle || meta.subtitle || '';
        if (!popups[targetId][category]) popups[targetId][category] = [];
        features[targetId].categories.push(category);
        popups[targetId][category].push({ title, subtitle });
    }
}

/** Build JSON, that MapLibreGL understands, containing all the markers. */
function buildFeatureCollection(
    features: Record<string, TMarkerFeatureProperties>
): TMarkerFeatureCollection {
    return {
        type: 'FeatureCollection',
        features: Object.values(features).map((p) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
            properties: p,
        })),
    };
}

async function writeOutput(
    dataDir: string,
    featureCollection: TMarkerFeatureCollection,
    popups: Popups
) {
    await fs.writeFile(
        path.join(dataDir, 'markers.json'),
        JSON.stringify(featureCollection)
    );
    await fs.writeFile(
        path.join(dataDir, 'popups.json'),
        JSON.stringify(popups)
    );

    console.log(
        `markers.json (${featureCollection.features.length}) and popups.json (${Object.keys(popups).length}) written.`
    );
}

async function build() {
    const popups: Popups = {};
    const features: Record<string, TMarkerFeatureProperties> = {};
    const deferredMarkers: DeferredMarker[] = [];
    for (const entry of await loadMarkerMetadata()) {
        const markers = await loadMarkersByCategory(entry);
        for (const marker of markers)
            if (marker.foreignId)
                deferredMarkers.push({
                    marker,
                    category: entry.category,
                    meta: entry,
                });
        await processDirectMarkers(markers, entry, features, popups);
    }
    processDeferredMarkers(deferredMarkers, popups, features);
    const featureCollection = buildFeatureCollection(features);
    await writeOutput(dataDir, featureCollection, popups);
}

build().catch((err) => {
    console.error(err);
    process.exit(1);
});
