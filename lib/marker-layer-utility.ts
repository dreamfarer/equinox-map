import { Marker, MergedMarker } from '@/types/marker';
import { markerCategories, MarkerCategory } from '@/types/marker-category';

export function isMarkerCategory(value: string): value is MarkerCategory {
  return markerCategories.includes(value as MarkerCategory);
}

export async function loadMarkersByCategory(): Promise<Marker[]> {
  const markerData = await Promise.all(
    markerCategories.map(async (category: MarkerCategory) => {
      const res = await fetch(`/markers/${category}.json`);
      const data = await res.json();
      return data.map((m: Omit<Marker, 'category'>) => ({
        ...m,
        category,
      }));
    }),
  );
  return markerData.flat();
}

export function mergeMarkersByCharacter(markers: Marker[]): MergedMarker[] {
  const byChar = new Map<string, MergedMarker>();

  for (const m of markers) {
    if (!m.character) continue;
    const id = m.character;
    const existing = byChar.get(id);

    if (!isMarkerCategory(m.category)) {
      console.warn(`Skipping unknown category "${m.category}" for marker:`, m);
      continue;
    }

    if (!existing) {
      if (m.lng == null || m.lat == null) continue;
      byChar.set(id, {
        character: id,
        map: m.map,
        lng: m.lng,
        lat: m.lat,
        title: m.title ?? id,
        subtitle: m.subtitle ?? '',
        icon: m.icon ?? '',
        categories: [m.category],
      });
    } else {
      if (m.subtitle) existing.subtitle = m.subtitle;
      if (m.icon) existing.icon = m.icon;
      if (!existing.categories.includes(m.category))
        existing.categories.push(m.category);
    }
  }

  return Array.from(byChar.values());
}
