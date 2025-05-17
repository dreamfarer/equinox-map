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
  const activeCategories = markerCategories.filter(
    (categories) => enabled[categories],
  );
  // Filter categories
  let categoryExpression: ExpressionSpecification | null = null;
  if (activeCategories.length < markerCategories.length) {
    categoryExpression = ['any'];
    for (const category of activeCategories) {
      categoryExpression.push(['in', category, ['get', 'categories']]);
    }
  }
  // Filter categories based on id (used for bookmarking)
  let idExpression: ExpressionSpecification | null = null;
  if (visibleIds && visibleIds.length > 0) {
    idExpression = ['in', ['get', 'id'], ['literal', visibleIds]];
  }
  let finalExpression: ExpressionSpecification | null = null;
  if (categoryExpression && idExpression)
    finalExpression = ['all', categoryExpression, idExpression];
  else if (categoryExpression) finalExpression = categoryExpression;
  else if (idExpression) finalExpression = idExpression;
  map.setFilter(layerId, finalExpression);
}
