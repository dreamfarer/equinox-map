import { useEffect, useState, useMemo } from 'react';
import { TBookmarkId } from '@/types/bookmark';

const BOOKMARKS_STORAGE_KEY = 'bookmarks-v2';

export function useBookmarkManager(): {
  bookmarkIds: TBookmarkId[];
  toggleBookmark: (id: TBookmarkId) => void;
  bookmarkedMarkerIds: string[] | null;
  showOnlyBookmarks: boolean;
  setShowOnlyBookmarks: (enabled: boolean) => void;
} {
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  const [bookmarkIds, setBookmarkIds] = useState<TBookmarkId[]>(() => {
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
  });

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarkIds));
  }, [bookmarkIds]);

  useEffect(() => {
    localStorage.removeItem('bookmarks');
  }, []);

  const toggleBookmark = (id: TBookmarkId) => {
    setBookmarkIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((b) => b !== id) : [...prev, id];

      window.dispatchEvent(
        new CustomEvent('bookmark-changed', {
          detail: {
            id,
            isBookmarked: !exists,
            bookmarks: updated,
          },
        })
      );

      return updated;
    });
  };

  const bookmarkedMarkerIds = useMemo(() => {
    if (!showOnlyBookmarks) return null;
    return Array.from(new Set(bookmarkIds.map((id) => id.split('::')[0])));
  }, [showOnlyBookmarks, bookmarkIds]);

  return {
    bookmarkIds,
    toggleBookmark,
    bookmarkedMarkerIds,
    showOnlyBookmarks,
    setShowOnlyBookmarks,
  };
}
