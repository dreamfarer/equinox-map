import { ExpressionSpecification, Map } from 'maplibre-gl';
import { ExtendedMap } from '@/types/extended-map';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { TPopups } from '@/types/popup';
import { categories, TCategory } from '@/types/category';

/**
 * Load the raw markers as GeoJSON for MapLibre and popups for the UI.
 */
export async function loadData(): Promise<{
  markers: TMarkerFeatureCollection;
  popups: TPopups;
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

function emptyFilter(): ExpressionSpecification {
  return ['in', ['get', 'id'], ['literal', []]];
}

/**
 * Filter markers and return both the filtered array and corresponding MapLibre filter expression.
 */
export function computeFilteredMarkersAndExpression(
  enabled: Record<TCategory, boolean>,
  bookmarkedIds: string[] | null,
  popups: TPopups,
  bookmarksOnly: boolean = false
): {
  filtered: TPopups;
  expression: ExpressionSpecification | null;
  activeCategories: TCategory[];
} {
  const activeCategories = categories.filter((cat) => enabled[cat]);
  const activeSet = new Set(activeCategories);

  const bookmarkedIdSet =
    bookmarkedIds && bookmarkedIds.length > 0
      ? new Set(bookmarkedIds.map((b) => b.split('::')[0]))
      : null;

  if (bookmarksOnly && !bookmarkedIdSet) {
    return { filtered: {}, expression: emptyFilter(), activeCategories: [] };
  }

  if (bookmarksOnly && bookmarkedIdSet) {
    const filtered: TPopups = Object.fromEntries(
      Object.entries(popups).filter(([markerId]) =>
        bookmarkedIdSet.has(markerId)
      )
    );

    return {
      filtered,
      expression: [
        'in',
        ['get', 'id'],
        ['literal', Array.from(bookmarkedIdSet)],
      ],
      activeCategories: [],
    };
  }

  if (
    (bookmarkedIds && bookmarkedIds.length === 0) ||
    activeCategories.length === 0
  ) {
    return { filtered: {}, expression: emptyFilter(), activeCategories: [] };
  }

  const filtered: TPopups = Object.fromEntries(
    Object.entries(popups).filter(([markerId, categoryPayloads]) => {
      const hasActiveCategory = Object.keys(categoryPayloads).some((cat) =>
        activeSet.has(cat as TCategory)
      );
      const isBookmarked = !bookmarkedIdSet || bookmarkedIdSet.has(markerId);
      return hasActiveCategory && isBookmarked;
    })
  );

  const categoryExpression: ExpressionSpecification | null =
    activeCategories.length === categories.length
      ? null
      : [
          'any',
          ...activeCategories.map(
            (cat) =>
              ['in', cat, ['get', 'categories']] as ExpressionSpecification
          ),
        ];

  const idExpression: ExpressionSpecification | null =
    bookmarkedIdSet !== null
      ? ['in', ['get', 'id'], ['literal', Array.from(bookmarkedIdSet)]]
      : null;

  let expression: ExpressionSpecification | null = null;
  if (categoryExpression && idExpression) {
    expression = ['all', categoryExpression, idExpression];
  } else {
    expression = categoryExpression ?? idExpression;
  }

  return { filtered, expression, activeCategories };
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
