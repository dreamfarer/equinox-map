import path from 'node:path';
import { TMarkerFeatureProperties } from '@/types/marker-feature';
import { convertToLngLat } from '../lib/convert';
import { MapMetadataRecord } from '@/types/map-metadata';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { MarkerSource } from '@/types/marker-source';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { Popups } from '@/types/popup';
import mapsJson from '../app/data/maps.json';

const mapMetadata = mapsJson as MapMetadataRecord;
const publicDir = path.resolve(__dirname, '../public');
const dataDir = path.resolve(__dirname, '../app/data');
const markerMetadataPath = path.resolve(__dirname, '../public/meta.json');

type DeferredMarkers = {
    marker: MarkerSource;
    category: string;
    meta: MetaEntry;
}[];

type PrimaryMarkers = Record<string, MarkerSource>;

type MetaEntry = {
    category: string;
    path: string;
    anchor?: 'bottom' | 'center';
    icon?: string;
    title?: string;
    subtitle?: string;
};

/** Write markers and popups for markers with explicit ID.*/
export async function processDirectMarkers(
    markerSource: MarkerSource[],
    entry: MetaEntry,
    features: Record<string, TMarkerFeatureProperties>,
    popups: Popups,
    mapCategories: Record<string, Set<string>>
) {
    for (const [index, marker] of markerSource.entries()) {
        if (
            marker.foreignId ||
            marker.x == null ||
            marker.y == null ||
            !marker.map
        )
            continue;

        if (!mapMetadata[marker.map]) {
            throw new Error(
                `Metadata for ${marker.map} map has not been defined in '../app/data/maps.json'`
            );
        }

        const [lng, lat] = convertToLngLat(
            mapMetadata[marker.map],
            marker.x,
            marker.y
        );
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
        if (!mapCategories[marker.map]) mapCategories[marker.map] = new Set();
        mapCategories[marker.map].add(entry.category);
        if (!popups[id]) popups[id] = {};
        if (!popups[id][entry.category]) popups[id][entry.category] = [];
        const title = marker.title?.trim() || entry.title || '';
        const subtitle = marker.subtitle?.trim() || entry.subtitle || '';
        popups[id][entry.category].push({ title, subtitle });
    }
}

/** Write markers and popups for markers with foreign ID.*/
function processDeferredMarkers(
    primaryMarkers: PrimaryMarkers,
    deferredMarkers: {
        marker: MarkerSource;
        category: string;
        meta: MetaEntry;
    }[],
    popups: Popups,
    features: Record<string, TMarkerFeatureProperties>,
    mapCategories: Record<string, Set<string>>
) {
    for (const { marker, category, meta } of deferredMarkers) {
        const targetId = marker.foreignId!.toLowerCase();
        if (!popups[targetId]) {
            console.error(`foreignId "${targetId}" not found!`);
            continue;
        }
        const foreignTitle = primaryMarkers[targetId]?.title;
        const title = marker.title || foreignTitle || meta.title || '';
        const subtitle = marker.subtitle || meta.subtitle || '';
        if (!popups[targetId][category]) popups[targetId][category] = [];
        features[targetId].categories.push(category);
        const mapId = features[targetId].map;
        if (!mapCategories[mapId]) mapCategories[mapId] = new Set();
        mapCategories[mapId].add(category);
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

/** Write markers and popups to files.*/
async function writeOutput(
    dataDir: string,
    featureCollection: TMarkerFeatureCollection,
    popups: Popups,
    mapCategories: Record<string, Set<string>>
) {
    const serializedMapCategories: Record<string, string[]> =
        Object.fromEntries(
            Object.entries(mapCategories).map(([mapId, cats]) => [
                mapId,
                [...cats].sort(),
            ])
        );
    await mkdir(dataDir, { recursive: true });
    await writeFile(
        path.join(dataDir, 'markers.json'),
        JSON.stringify(featureCollection)
    );
    await writeFile(path.join(dataDir, 'popups.json'), JSON.stringify(popups));
    await writeFile(
        path.join(dataDir, 'map-categories.json'),
        JSON.stringify(serializedMapCategories, null, 4)
    );
    console.log(
        `markers.json (${featureCollection.features.length}), popups.json (${Object.keys(popups).length}), and map-categories.json (${Object.keys(serializedMapCategories).length} maps) written.`
    );
}

async function build() {
    const popups: Popups = {};
    const features: Record<string, TMarkerFeatureProperties> = {};
    const primaryMarkers: PrimaryMarkers = {};
    const deferredMarkers: DeferredMarkers = [];
    const mapCategories: Record<string, Set<string>> = {};
    const markerMetadata = JSON.parse(
        await readFile(markerMetadataPath, 'utf8')
    );
    for (const metadataEntry of markerMetadata) {
        const markersPath = path.join(publicDir, metadataEntry.path);
        const markers = JSON.parse(await readFile(markersPath, 'utf8'));
        for (const marker of markers) {
            if (marker.foreignId)
                deferredMarkers.push({
                    marker,
                    category: metadataEntry.category,
                    meta: metadataEntry,
                });
            else primaryMarkers[marker.id!] = marker;
        }
        await processDirectMarkers(
            markers,
            metadataEntry,
            features,
            popups,
            mapCategories
        );
    }
    processDeferredMarkers(
        primaryMarkers,
        deferredMarkers,
        popups,
        features,
        mapCategories
    );
    const featureCollection = buildFeatureCollection(features);
    await writeOutput(dataDir, featureCollection, popups, mapCategories);
}

build().catch((err) => {
    console.error(err);
    process.exit(1);
});
