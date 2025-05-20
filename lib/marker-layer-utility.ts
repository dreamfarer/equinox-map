import { ExpressionSpecification, Map } from 'maplibre-gl';
import { ExtendedMap } from '@/types/extended-map';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { TPopup } from '@/types/popup';
import { categories, TCategory } from '@/types/category';

/**
 * Load the raw markers as GeoJSON for MapLibre and popups for the UI.
 */
export async function loadData(): Promise<{
  markers: TMarkerFeatureCollection;
  popups: TPopup[];
}> {
  const [markers, popups] = await Promise.all([
    fetch('/markers/markers.geojson').then((r) => r.json()),
    fetch('/markers/popups.json').then((r) => r.json()),
  ]);
  return { markers, popups };
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
  enabled: Record<TCategory, boolean>,
  bookmarkedIds: string[] | null,
  popups: TPopup[]
): {
  filtered: TPopup[];
  expression: ExpressionSpecification | null;
  activeCategories: TCategory[];
} {
  if (bookmarkedIds && bookmarkedIds.length > 0) {
    const visibleIdSet = new Set(bookmarkedIds);
    const filtered = popups.filter((m) => visibleIdSet.has(m.id));
    return {
      filtered,
      expression: ['in', ['get', 'id'], ['literal', bookmarkedIds]],
      activeCategories: [],
    };
  }

  const activeCategories = categories.filter((cat) => enabled[cat]);

  if (activeCategories.length === categories.length) {
    return { filtered: popups, expression: null, activeCategories };
  }

  const activeSet = new Set(activeCategories);
  const filtered = popups.filter((popup) =>
    Object.keys(popup.categories).some((cat) => activeSet.has(cat as TCategory))
  );

  const categoryExpression: ExpressionSpecification = [
    'any',
    ...activeCategories.map(
      (cat) => ['in', cat, ['get', 'categories']] as ExpressionSpecification
    ),
  ];

  return { filtered, expression: categoryExpression, activeCategories };
}

/**
 * Remove popup and unmount React root safely.
 */
export function safelyRemovePopup(map: Map) {
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
