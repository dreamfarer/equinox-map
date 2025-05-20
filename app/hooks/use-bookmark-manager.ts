import { useEffect, useState, useCallback } from 'react';
import { TBookmark } from '@/types/bookmark';

export function useBookmarkManager(): {
  bookmarks: TBookmark[];
  toggleBookmark: (id: string, category: string) => void;
  bookmarkedIds: string[] | null;
  showOnlyBookmarks: (enabled: boolean) => void;
} {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[] | null>(null);
  const [bookmarks, setBookmarks] = useState<TBookmark[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = JSON.parse(localStorage.getItem('bookmarks') ?? '[]');
      if (!Array.isArray(raw)) return [];
      const isValid = raw.every(
        (b) =>
          b &&
          typeof b === 'object' &&
          typeof b.id === 'string' &&
          typeof b.category === 'string'
      );
      return isValid ? (raw as TBookmark[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (id: string, category: string) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === id && b.category === category);
      const next = exists
        ? prev.filter((b) => !(b.id === id && b.category === category))
        : [...prev, { id, category }];

      window.dispatchEvent(
        new CustomEvent('bookmark-changed', {
          detail: {
            id,
            category,
            isBookmarked: !exists,
            bookmarks: next,
          },
        })
      );

      return next;
    });
  };

  const showOnlyBookmarks = useCallback(
    (enabled: boolean) => {
      if (!enabled) {
        setBookmarkedIds(null);
      } else {
        const ids = bookmarks.map((b) => b.id);
        setBookmarkedIds(ids);
      }
    },
    [bookmarks]
  );

  return {
    bookmarks,
    toggleBookmark,
    bookmarkedIds,
    showOnlyBookmarks,
  };
}
