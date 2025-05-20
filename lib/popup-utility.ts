import { TBookmark } from '@/types/bookmark';
import { TCategory } from '@/types/category';
import { TPopup } from '@/types/popup';
import { TPopupPayload } from '@/types/popup-payload';

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

export function getFilteredPopupCategories(
  popup: TPopup,
  isBookmarkMode: boolean,
  activeCategories: TCategory[],
  bookmarks: TBookmark[]
): Record<string, TPopupPayload> {
  const entries = Object.entries(popup.categories);
  const relevant = isBookmarkMode
    ? entries.filter(([cat]) =>
        bookmarks.some((b) => b.id === popup.id && b.category === cat)
      )
    : entries.filter(([cat]) => activeCategories.includes(cat as TCategory));
  return Object.fromEntries(relevant);
}

export function getBookmarkedCategories(
  id: string,
  bookmarks: TBookmark[]
): string[] {
  return bookmarks.filter((b) => b.id === id).map((b) => b.category);
}

export function createCategoriesKey(
  categories: Record<string, TPopupPayload>
): string {
  return Object.keys(categories).sort().join('|');
}
