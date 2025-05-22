import { TBookmarkId } from '@/types/bookmark';
import { TCategory } from '@/types/category';
import { TCategoryPayloads, TPopups } from '@/types/popup';

/* Calculate the popup offset dependent on the anchor. */
export function calculatePopupOffset(
  anchor: 'center' | 'bottom'
): Record<string, [number, number]> {
  return anchor === 'center'
    ? {
        top: [0, 20],
        bottom: [0, -20],
        left: [20, 0],
        right: [-20, 0],
        'top-left': [17, 17],
        'top-right': [-17, 17],
        'bottom-left': [17, -17],
        'bottom-right': [-17, -17],
      }
    : {
        top: [0, 5],
        bottom: [0, -40],
        left: [18, -18],
        right: [-18, -18],
        'top-left': [12, 0],
        'top-right': [-12, 0],
        'bottom-left': [14, -32],
        'bottom-right': [-14, -32],
      };
}

/* Return a flat array of category IDs that need to be shown inside a popup. */
export function getFilteredPopupCategories(
  markerId: string,
  popups: TPopups,
  isBookmarkMode: boolean,
  bookmarks: TBookmarkId[],
  activeCategories: TCategory[] = []
): TCategoryPayloads {
  const fullPopup = popups[markerId];
  if (!fullPopup) return {};

  const result: TCategoryPayloads = {};

  if (isBookmarkMode) {
    const itemIdsForMarker = bookmarks
      .filter((b) => b.startsWith(`${markerId}::`))
      .map((b) => {
        const [, categoryId, itemId] = b.split('::');
        return { categoryId, itemId };
      });

    for (const { categoryId, itemId } of itemIdsForMarker) {
      const categoryItems = fullPopup[categoryId];
      if (!categoryItems) continue;

      const item = categoryItems[itemId];
      if (!item) continue;

      if (!result[categoryId]) result[categoryId] = {};
      result[categoryId][itemId] = item;
    }

    return result;
  }

  for (const [categoryId, items] of Object.entries(fullPopup)) {
    if (activeCategories.includes(categoryId as TCategory)) {
      result[categoryId as TCategory] = items;
    }
  }

  return result;
}

export function createCategoriesKey(categories: TCategoryPayloads): string {
  const parts: string[] = [];

  const sortedCategories = Object.keys(categories).sort();
  for (const category of sortedCategories) {
    const items = categories[category];
    const sortedItemIds = Object.keys(items).sort();

    for (const itemId of sortedItemIds) {
      parts.push(`${category}::${itemId}`);
    }
  }

  return parts.join('|');
}
