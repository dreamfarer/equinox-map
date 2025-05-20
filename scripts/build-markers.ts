import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { TPopupPayload } from '@/types/popup-payload';

type MetaEntry = {
  category: string;
  path: string;
  anchor?: 'bottom' | 'center';
  icon?: string;
  title?: string;
  subtitle?: string;
};

type Marker = {
  title?: string;
  subtitle?: string;
  id?: string;
  foreignId?: string;
  map: string;
  icon?: string;
  lng: number;
  lat: number;
};

type MergedMarker = {
  id: string;
  categories: Record<string, TPopupPayload>;
};

type MarkerGeoProperties = {
  id: string;
  map: string;
  lng: number;
  lat: number;
  icon: string;
  anchor: 'bottom' | 'center';
  categories: string[];
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function build() {
  const publicDir = path.resolve(__dirname, '../public');
  const metaPath = path.join(publicDir, 'meta.json');
  const meta = JSON.parse(await fs.readFile(metaPath, 'utf8')) as MetaEntry[];

  const flat: Record<string, MergedMarker> = {};
  const geo: Record<string, MarkerGeoProperties> = {};
  const originalTitles: Record<string, { title: string; subtitle: string }> =
    {};
  const deferred: { m: Marker; category: string; meta: MetaEntry }[] = [];

  for (const entry of meta) {
    const {
      category,
      path: relPath,
      anchor: metaAnchor = 'bottom',
      icon: metaIcon,
      title: metaTitle,
      subtitle: metaSubtitle,
    } = entry;

    const absPath = path.join(publicDir, relPath);
    const raw = JSON.parse(await fs.readFile(absPath, 'utf8')) as Marker[];

    for (const m of raw) {
      if (m.foreignId) {
        deferred.push({ m, category, meta: entry });
        continue;
      }

      if (m.lng == null || m.lat == null || !m.map) {
        console.warn(
          `Skipping marker without coordinates and/or map in "${relPath}":`,
          m
        );
        continue;
      }

      let id: string;
      if (m.id?.trim()) id = m.id.trim();
      else if (m.title?.trim()) id = slugify(`${m.title}-${m.lng}-${m.lat}`);
      else id = randomUUID();
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
        lng: m.lng,
        lat: m.lat,
        icon: resolvedIcon,
        anchor,
        categories: [category],
      };

      flat[id] = {
        id,
        categories: {
          [category]: {
            items: [
              {
                title: resolvedTitle,
                subtitle: resolvedSubtitle,
              },
            ],
          },
        },
      };

      originalTitles[id] = { title: resolvedTitle, subtitle: resolvedSubtitle };
    }
  }

  for (const { m, category, meta } of deferred) {
    const targetId = m.foreignId!.toLowerCase();
    const baseMarker = flat[targetId];
    const geoMarker = geo[targetId];

    if (!baseMarker || !geoMarker) {
      console.warn(
        `foreignId "${targetId}" not found (category "${category}") – skipping`
      );
      continue;
    }

    const original = originalTitles[targetId] || { title: '', subtitle: '' };
    const fallbackTitle = m.title || meta.title || original.title;
    const fallbackSubtitle = m.subtitle || meta.subtitle || original.subtitle;

    if (!baseMarker.categories[category]) {
      baseMarker.categories[category] = { items: [] };
      geoMarker.categories.push(category);
    }

    baseMarker.categories[category].items.push({
      title: m.title || fallbackTitle,
      subtitle: m.subtitle || fallbackSubtitle,
    });
  }

  const geojson = {
    type: 'FeatureCollection',
    features: Object.values(geo).map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: p,
    })),
  };

  await fs.writeFile(
    path.join(publicDir, 'markers/markers.geojson'),
    JSON.stringify(geojson)
  );

  await fs.writeFile(
    path.join(publicDir, 'markers/popups.json'),
    JSON.stringify(Object.values(flat))
  );

  console.log(
    `markers.geojson (${geojson.features.length}) and popups.json (${Object.keys(flat).length}) written.`
  );
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
