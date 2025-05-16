import {
  MarkerCategory,
  MarkerFeatureCollection,
  MergedMarker,
} from '@/types/marker';

export async function loadMergedMarkers(): Promise<MergedMarker[]> {
  const res = await fetch('/markers/markers.geojson', { cache: 'force-cache' });
  const geo: MarkerFeatureCollection = await res.json();

  return geo.features.map((f) => ({
    id: f.properties.id,
    map: f.properties.map,
    lng: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
    title: f.properties.title,
    subtitle: f.properties.subtitle,
    icon: f.properties.icon,
    categories: f.properties.categories as MarkerCategory[],
  }));
}
