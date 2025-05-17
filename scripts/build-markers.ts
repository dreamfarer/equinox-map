import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

type MetaEntry = {
  category: string;
  path: string;
  anchor?: 'bottom' | 'center';
  icon?: string;
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
  map: string;
  lng: number;
  lat: number;
  title: string;
  subtitle: string;
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

  const base: Record<string, MergedMarker> = {};
  const deferred: { m: Marker; category: string }[] = [];

  for (const entry of meta) {
    const {
      category,
      path: relPath,
      anchor: metaAnchor = 'bottom',
      icon: metaIcon,
    } = entry;

    const absPath = path.join(publicDir, relPath);
    const raw = JSON.parse(await fs.readFile(absPath, 'utf8')) as Marker[];

    for (const m of raw) {
      if (m.foreignId) {
        deferred.push({ m, category });
        continue;
      }

      if (m.lng == null || m.lat == null || !m.map) {
        console.warn(
          `Skipping marker without coordinates and/or map in "${relPath}":`,
          m,
        );
        continue;
      }

      let id: string;
      if (m.id?.trim()) id = m.id.trim();
      else if (m.title?.trim()) id = slugify(m.title);
      else id = randomUUID();
      id = id.toLowerCase();

      const resolvedIcon = m.icon?.trim() || metaIcon || 'default-marker';
      const anchor: 'bottom' | 'center' =
        resolvedIcon === 'default-marker'
          ? 'bottom'
          : metaAnchor === 'center'
            ? 'center'
            : 'bottom';

      base[id] = {
        id,
        map: m.map,
        lng: m.lng,
        lat: m.lat,
        title: m.title ?? '',
        subtitle: m.subtitle ?? '',
        icon: resolvedIcon,
        anchor,
        categories: [category],
      };
    }
  }

  for (const { m, category } of deferred) {
    const targetId = m.foreignId!.toLowerCase();
    const target = base[targetId];

    if (!target) {
      console.warn(
        `foreignId "${targetId}" not found (category "${category}") – skipping`,
      );
      continue;
    }

    if (m.subtitle && !target.subtitle) target.subtitle = m.subtitle;
    if (m.icon && !target.icon) target.icon = m.icon;
    if (!target.categories.includes(category)) target.categories.push(category);
  }

  const features = Object.values(base).map((m) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
    properties: {
      id: m.id,
      title: m.title,
      subtitle: m.subtitle,
      icon: m.icon,
      anchor: m.anchor,
      map: m.map,
      categories: m.categories,
    },
  }));

  const geojson = { type: 'FeatureCollection', features } as const;

  await fs.writeFile(
    path.join(publicDir, 'markers/markers.geojson'),
    JSON.stringify(geojson),
  );
  console.log(
    `Generated markers.geojson with ${features.length} features → public/markers/markers.geojson`,
  );
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
