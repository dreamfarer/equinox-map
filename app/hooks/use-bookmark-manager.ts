import { useEffect, useState, useMemo } from 'react';
import { TBookmarkId } from '@/types/bookmark';
import {
  getCategoryBookmarkMap,
  loadBookmarks,
  removeBookmarks,
  saveBookmarks,
} from '@/lib/bookmark-utility';
import { TPopups } from '@/types/popup';
import { useMenuState } from '../context/menu-state';

export function useBookmarkManager(popups: TPopups): {
  bookmarkIds: TBookmarkId[];
  categoryBookmarkMap: Record<string, string[]>;
  bookmarkedMarkerIds: string[] | null;
  toggleBookmark: (id: TBookmarkId) => void;
  toggleBookmarks: (categoryId: string) => void;
  clearBookmarks: () => void;
} {
  const [bookmarkIds, setBookmarkIds] = useState<TBookmarkId[]>(loadBookmarks);
  const { activeMenuName } = useMenuState();

  const categoryBookmarkMap = useMemo(
    () => getCategoryBookmarkMap(popups),
    [popups]
  );
  const bookmarkedMarkerIds = useMemo(() => {
    if (activeMenuName !== 'bookmarks') return null;
    return Array.from(new Set(bookmarkIds.map((id) => id.split('::')[0])));
  }, [activeMenuName, bookmarkIds]);

  useEffect(() => {
    saveBookmarks(bookmarkIds);
  }, [bookmarkIds]);

  useEffect(() => {
    removeBookmarks();
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

  const toggleBookmarks = (categoryId: string) => {
    const ids = categoryBookmarkMap[categoryId] || [];

    setBookmarkIds((prev) => {
      const current = new Set(prev);
      const anyBookmarked = ids.some((id) => current.has(id));

      const updated = anyBookmarked
        ? prev.filter((id) => !ids.includes(id))
        : [...new Set([...prev, ...ids])];

      window.dispatchEvent(
        new CustomEvent('bookmark-changed', {
          detail: {
            id: categoryId,
            isBookmarked: !anyBookmarked,
            bookmarks: updated,
          },
        })
      );

      return updated;
    });
  };

  const clearBookmarks = () => {
    setBookmarkIds((prev) => {
      if (prev.length === 0) return prev;
      window.dispatchEvent(
        new CustomEvent('bookmark-changed', {
          detail: { id: 'all', isBookmarked: false, bookmarks: [] },
        })
      );
      return [];
    });
  };

  return {
    bookmarkIds,
    bookmarkedMarkerIds,
    categoryBookmarkMap,
    toggleBookmark,
    toggleBookmarks,
    clearBookmarks,
  };
}
