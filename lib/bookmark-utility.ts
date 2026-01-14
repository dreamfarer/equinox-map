import { TBookmarkId } from '@/types/bookmark';
import { TPopups } from '@/types/popup';

const BOOKMARKS_STORAGE_KEY = 'bookmarks-v2';

/**
 * Load bookmarks from local storage.
 */
export function loadBookmarks() {
    if (typeof window === 'undefined') return [];
    try {
        const raw = JSON.parse(
            localStorage.getItem(BOOKMARKS_STORAGE_KEY) ?? '[]'
        );
        return Array.isArray(raw) && raw.every((s) => typeof s === 'string')
            ? raw
            : [];
    } catch {
        return [];
    }
}

/**
 * Save bookmarks to local storage.
 */
export function saveBookmarks(bookmarkIds: string[]) {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarkIds));
}

/**
 * Remove old bookmarking formats in local storage.
 */
export function removeBookmarks() {
    localStorage.removeItem('bookmarks');
}

/**
 * Create a record such that all bookmark Ids can be retrieved by supplying the category Id.
 */
export function getCategoryBookmarkMap(
    popups: TPopups
): Record<string, TBookmarkId[]> {
    const map: Record<string, TBookmarkId[]> = {};
    for (const [markerId, categories] of Object.entries(popups)) {
        for (const [categoryId, items] of Object.entries(categories)) {
            if (!map[categoryId]) map[categoryId] = [];
            for (const itemId of Object.keys(items)) {
                map[categoryId].push(`${markerId}::${categoryId}::${itemId}`);
            }
        }
    }
    return map;
}
