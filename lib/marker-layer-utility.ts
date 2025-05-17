import {
  MarkerCategory,
  MarkerFeatureCollection,
  MergedMarker,
} from '@/types/marker';

export async function loadMergedMarkers(): Promise<MergedMarker[]> {
  // TO-DO: implement proper caching: const res = await fetch('/markers/markers.geojson', { cache: 'force-cache' });
  const res = await fetch('/markers/markers.geojson', { cache: 'no-store' });
  const geo: MarkerFeatureCollection = await res.json();

  return geo.features.map((f) => ({
    id: f.properties.id,
    map: f.properties.map,
    lng: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
    title: f.properties.title,
    subtitle: f.properties.subtitle,
    icon: f.properties.icon,
    anchor: f.properties.anchor,
    categories: f.properties.categories as MarkerCategory[],
  }));
}
