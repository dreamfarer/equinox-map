import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

type Marker = {
  title: string;
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
  map: string;
  lng: number;
  lat: number;
  title: string;
  subtitle: string;
  icon: string;
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
  const markerDir = path.resolve(__dirname, '../public/markers');
  const files = (await fs.readdir(markerDir)).filter((f) =>
    f.endsWith('.json'),
  );
  const categories = files.map((f) => path.basename(f, '.json'));

  const base: Record<string, MergedMarker> = {};
  const deferred: { m: Marker; category: string }[] = [];

  // 1. Ingest all base markers (without foreignId)
  for (const file of files) {
    const category = path.basename(file, '.json');
    const raw = JSON.parse(
      await fs.readFile(path.join(markerDir, file), 'utf8'),
    ) as Marker[];

    for (const m of raw) {
      if (m.foreignId) {
        deferred.push({ m, category });
        continue;
      }

      if (m.lng == null || m.lat == null) {
        console.warn(`Skipping marker without coordinates in "${file}":`, m);
        continue;
      }

      const id = (
        m.id?.trim() ||
        slugify(m.title) ||
        randomUUID()
      ).toLowerCase();

      base[id] = {
        id,
        map: m.map,
        lng: m.lng,
        lat: m.lat,
        title: m.title ?? id,
        subtitle: m.subtitle ?? '',
        icon: m.icon ?? '',
        categories: [category],
      };
    }
  }

  // 2. Merge deferred markers that reference a foreignId
  for (const { m, category } of deferred) {
    const targetId = m.foreignId!.toLowerCase();
    const target = base[targetId];

    if (!target) {
      console.warn(
        `foreignId "${targetId}" not found (category "${category}") - skipping`,
      );
      continue;
    }

    if (m.subtitle && !target.subtitle) target.subtitle = m.subtitle;
    if (m.icon && !target.icon) target.icon = m.icon;
    if (!target.categories.includes(category)) target.categories.push(category);
  }

  // Convert to GeoJSON FeatureCollection
  const features = Object.values(base).map((m) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [m.lng, m.lat],
    },
    properties: {
      id: m.id,
      title: m.title,
      subtitle: m.subtitle,
      icon: m.icon,
      map: m.map,
      categories: m.categories,
    },
  }));

  const geojson = { type: 'FeatureCollection', features } as const;

  await fs.writeFile(
    path.join(markerDir, 'markers.geojson'),
    JSON.stringify(geojson),
  );
  console.log(
    `Generated markers.geojson with ${features.length} features → ${path.relative(process.cwd(), markerDir)}/markers.geojson`,
  );
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
