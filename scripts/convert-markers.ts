import fs from 'fs/promises';
import path from 'path';
import { randomUUID, createHash } from 'crypto';
import { TPopups } from '@/types/popup';
import { TMarkerFeatureProperties } from '@/types/marker-feature';
import { convertToLngLat } from '../lib/convert';
import { MapMetadata } from '@/types/map-metadata';

type MetaEntry = {
    category: string;
    path: string;
    anchor?: 'bottom' | 'center';
    icon?: string;
    title?: string;
    subtitle?: string;
};

export type MarkerSource = {
    title?: string;
    subtitle?: string;
    id?: string;
    foreignId?: string;
    map: string;
    icon?: string;
    x: number;
    y: number;
};

let cachedMapJson: Record<string, MapMetadata> | null = null;

async function loadMapJson(): Promise<Record<string, MapMetadata> | null> {
    if (!cachedMapJson) {
        const dataDir = path.resolve(__dirname, '../app/data');
        const json = await fs.readFile(path.join(dataDir, 'maps.json'), 'utf8');
        cachedMapJson = JSON.parse(json);
    }
    return cachedMapJson;
}

async function getMapMetadata(map: string): Promise<MapMetadata> {
    const mapJson = await loadMapJson();
    if (!mapJson) {
        throw new Error(`Missing map.json in /public`);
    }
    const meta = mapJson[map];
    if (!meta) {
        throw new Error(`Missing map metadata for: ${map}`);
    }
    return meta;
}

/** Converts an arbitrary string to a URL‑friendly slug */
function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFKD')
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/** Generates a unique item key (no colons anymore – path segments are object keys) */
function makeItemKey(title: string, existing: Set<string>): string {
    const base = slugify(title);
    if (!existing.has(base)) {
        existing.add(base);
        return base;
    }
    const hash = createHash('md5').update(title).digest('hex').slice(0, 6);
    const finalKey = `${base}-${hash}`;
    existing.add(finalKey);
    return finalKey;
}

async function loadMeta(metaPath: string): Promise<MetaEntry[]> {
    const data = await fs.readFile(metaPath, 'utf8');
    return JSON.parse(data) as MetaEntry[];
}

async function loadMarkers(
    entry: MetaEntry,
    publicDir: string
): Promise<MarkerSource[]> {
    const absPath = path.join(publicDir, entry.path);
    const data = await fs.readFile(absPath, 'utf8');
    return JSON.parse(data) as MarkerSource[];
}

export async function processDirectMarkers(
    raw: MarkerSource[],
    entry: MetaEntry,
    geo: Record<string, TMarkerFeatureProperties>,
    popups: TPopups,
    originalTitles: Record<string, { title: string; subtitle: string }>,
    slugRegistry: Record<string, Set<string>>
) {
    const {
        category,
        anchor: metaAnchor = 'bottom',
        icon: metaIcon,
        title: metaTitle,
        subtitle: metaSubtitle,
    } = entry;

    for (const m of raw) {
        if (m.foreignId || m.x == null || m.y == null || !m.map) continue;

        const map = await getMapMetadata(m.map);
        const [lng, lat] = convertToLngLat(map, m.x, m.y);

        let id =
            m.id?.trim() ||
            (m.title ? slugify(`${m.title}-${lng}-${lat}`) : randomUUID());
        id = id.toLowerCase();

        const resolvedIcon = m.icon?.trim() || metaIcon || 'default-marker';
        const resolvedTitle = m.title?.trim() || metaTitle || '';
        const resolvedSubtitle = m.subtitle?.trim() || metaSubtitle || '';
        const anchor: 'bottom' | 'center' =
            resolvedIcon === 'default-marker'
                ? 'bottom'
                : metaAnchor === 'center'
                  ? 'center'
                  : 'bottom';

        geo[id] = {
            id,
            map: m.map,
            lng,
            lat,
            icon: resolvedIcon,
            anchor,
            categories: [category],
        };

        const slugSet = (slugRegistry[`${id}::${category}`] ??=
            new Set<string>());
        const itemKey = makeItemKey(resolvedTitle, slugSet);

        if (!popups[id]) popups[id] = {};
        if (!popups[id][category]) popups[id][category] = {};

        popups[id][category][itemKey] = {
            title: resolvedTitle,
            subtitle: resolvedSubtitle,
        };

        originalTitles[id] = {
            title: resolvedTitle,
            subtitle: resolvedSubtitle,
        };
    }
}

function processDeferredMarkers(
    deferred: { m: MarkerSource; category: string; meta: MetaEntry }[],
    popups: TPopups,
    originalTitles: Record<string, { title: string; subtitle: string }>,
    slugRegistry: Record<string, Set<string>>,
    geo: Record<string, TMarkerFeatureProperties>
) {
    for (const { m, category, meta } of deferred) {
        const targetId = m.foreignId!.toLowerCase();
        const base = popups[targetId];

        if (!base) {
            console.warn(
                `foreignId "${targetId}" not found (category "${category}") – skipping`
            );
            continue;
        }

        const original = originalTitles[targetId] || {
            title: '',
            subtitle: '',
        };
        const title = m.title || meta.title || original.title;
        const subtitle = m.subtitle || meta.subtitle || original.subtitle;

        if (!base[category]) base[category] = {};

        const geoCats = geo[targetId].categories;
        if (!geoCats.includes(category)) geoCats.push(category);

        const slugSet = (slugRegistry[`${targetId}::${category}`] ??=
            new Set<string>());
        const itemKey = makeItemKey(title, slugSet);

        base[category][itemKey] = { title, subtitle };
    }
}

function buildGeoJSON(geo: Record<string, TMarkerFeatureProperties>) {
    return {
        type: 'FeatureCollection',
        features: Object.values(geo).map((p) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
            properties: p,
        })),
    };
}

async function writeOutput(
    publicDir: string,
    dataDir: string,
    geojson: any,
    popups: TPopups
) {
    await fs.writeFile(
        path.join(publicDir, 'markers/markers.geojson'),
        JSON.stringify(geojson)
    );
    await fs.writeFile(
        path.join(dataDir, 'popups.json'),
        JSON.stringify(popups)
    );

    console.log(
        `markers.geojson (${geojson.features.length}) and popups.json (${Object.keys(popups).length}) written.`
    );
}

async function build() {
    const publicDir = path.resolve(__dirname, '../public');
    const dataDir = path.resolve(__dirname, '../app/data');
    const meta = await loadMeta(path.join(publicDir, 'meta.json'));

    const popups: TPopups = {};
    const geo: Record<string, TMarkerFeatureProperties> = {};
    const originalTitles: Record<string, { title: string; subtitle: string }> =
        {};
    const deferred: { m: MarkerSource; category: string; meta: MetaEntry }[] =
        [];
    const slugRegistry: Record<string, Set<string>> = {};

    for (const entry of meta) {
        const raw = await loadMarkers(entry, publicDir);

        // collect deferred first so we preserve order of direct markers in popups
        for (const m of raw)
            if (m.foreignId)
                deferred.push({ m, category: entry.category, meta: entry });

        await processDirectMarkers(
            raw,
            entry,
            geo,
            popups,
            originalTitles,
            slugRegistry
        );
    }

    processDeferredMarkers(deferred, popups, originalTitles, slugRegistry, geo);

    const geojson = buildGeoJSON(geo);
    await writeOutput(publicDir, dataDir, geojson, popups);
}

build().catch((err) => {
    console.error(err);
    process.exit(1);
});
