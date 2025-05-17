import { ExpressionSpecification, Map } from 'maplibre-gl';
import {
  markerCategories,
  MarkerCategory,
  MarkerFeatureCollection,
  MergedMarker,
} from '@/types/marker';

/**
 * Load the raw markers as GeoJSON for MapLibre and as MergedMarker array for the UI.
 */
export async function loadMarkers(): Promise<{
  geojson: GeoJSON.FeatureCollection;
  flat: MergedMarker[];
}> {
  // TO-DO: implement proper caching: const res = await fetch('/markers/markers.geojson', { cache: 'force-cache' });
  const res = await fetch('/markers/markers.geojson', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch markers.geojson');
  const geojson = (await res.json()) as MarkerFeatureCollection;
  const flat: MergedMarker[] = geojson.features.map((f) => ({
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
  return { geojson, flat };
}

/**
 * Load marker icons.
 */
export async function loadIcon(
  map: Map,
  url: string,
): Promise<HTMLImageElement | ImageBitmap> {
  const result = await map.loadImage(url);
  return result.data;
}

/**
 * Dynamically update the filter on 'markers-layer'.
 * Build expressions that are evaluated by the map engine internally.
 */
export function applyFilter(
  map: Map,
  enabled: Record<MarkerCategory, boolean>,
  visibleIds: string[] | null,
) {
  const layerId = 'markers-layer';
  if (!map.getLayer(layerId)) return;
  // Filter categories based on id (used for bookmarking)
  if (visibleIds && visibleIds.length > 0) {
    const idExpression: ExpressionSpecification = [
      'in',
      ['get', 'id'],
      ['literal', visibleIds],
    ];
    map.setFilter(layerId, idExpression);
    return;
  }
  // Filter categories
  const activeCategories = markerCategories.filter(
    (category) => enabled[category],
  );
  if (activeCategories.length < markerCategories.length) {
    const categoryExpression: ExpressionSpecification = ['any'];
    for (const category of activeCategories) {
      categoryExpression.push(['in', category, ['get', 'categories']]);
    }
    map.setFilter(layerId, categoryExpression);
  } else {
    map.setFilter(layerId, null);
  }
}
