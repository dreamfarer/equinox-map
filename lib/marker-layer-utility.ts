import { ExpressionSpecification, Map } from 'maplibre-gl';
import {
  markerCategories,
  MarkerCategory,
  MarkerFeatureCollection,
  MergedMarker,
} from '@/types/marker';
import { ExtendedMap } from '@/types/extended-map';

/**
 * Load the raw markers as GeoJSON for MapLibre and as MergedMarker array for the UI.
 */
export async function loadMarkers(): Promise<{
  geojson: GeoJSON.FeatureCollection;
  flat: MergedMarker[];
}> {
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
  url: string
): Promise<HTMLImageElement | ImageBitmap> {
  const result = await map.loadImage(url);
  return result.data;
}

/**
 * Filter markers and return both the filtered array and corresponding MapLibre filter expression.
 */
export function computeFilteredMarkersAndExpression(
  enabled: Record<MarkerCategory, boolean>,
  visibleIds: string[] | null,
  markers: MergedMarker[]
): {
  filtered: MergedMarker[];
  expression: ExpressionSpecification | null;
} {
  if (visibleIds && visibleIds.length > 0) {
    const visibleIdSet = new Set(visibleIds);
    const filtered = markers.filter((m) => visibleIdSet.has(m.id));
    const expression: ExpressionSpecification = [
      'in',
      ['get', 'id'],
      ['literal', visibleIds],
    ];
    return { filtered, expression };
  }

  const activeCategories = markerCategories.filter((cat) => enabled[cat]);

  if (activeCategories.length === markerCategories.length) {
    return { filtered: markers, expression: null };
  }

  const activeSet = new Set(activeCategories);
  const filtered = markers.filter((marker) =>
    marker.categories.some((cat) => activeSet.has(cat as MarkerCategory))
  );

  const categoryExpression: ExpressionSpecification = [
    'any',
    ...activeCategories.map(
      (cat) => ['in', cat, ['get', 'categories']] as ExpressionSpecification
    ),
  ];

  return { filtered, expression: categoryExpression };
}

/**
 * Remove popup and unmount React root safely.
 */
function safelyRemovePopup(map: Map) {
  const popup = (map as ExtendedMap).__activePopupInstance;
  const root = (map as ExtendedMap).__activePopupRoot;

  if (popup && root) {
    popup.remove();
    requestIdleCallback(() => {
      try {
        root.unmount();
      } catch (e) {
        console.warn('Popup unmount failed:', e);
      }
    });

    (map as ExtendedMap).__activePopupInstance = null;
    (map as ExtendedMap).__activePopupRoot = null;
    (map as ExtendedMap).__activePopupMarkerId = null;
  }
}

/**
 * Dynamically update the filter on 'markers-layer'.
 */
export function applyFilter(
  map: Map,
  enabled: Record<MarkerCategory, boolean>,
  visibleIds: string[] | null,
  markers: MergedMarker[]
) {
  const { filtered, expression } = computeFilteredMarkersAndExpression(
    enabled,
    visibleIds,
    markers
  );

  const layerId = 'markers-layer';
  if (!map.getLayer(layerId)) return;

  const activeId = (map as ExtendedMap).__activePopupMarkerId;
  const isPopupStillValid = filtered.some((m) => m.id === activeId);
  if (!isPopupStillValid) safelyRemovePopup(map);

  map.setFilter(layerId, expression);
}
