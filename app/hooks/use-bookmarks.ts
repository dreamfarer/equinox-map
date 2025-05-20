import { useEffect, useState } from 'react';
import { TBookmark } from '@/types/bookmark';

export function useBookmarks(): [
  TBookmark[],
  (id: string, category: string) => void,
] {
  const [bookmarks, setBookmarks] = useState<TBookmark[]>(() => {
    if (typeof window === 'undefined') return [];

    try {
      const raw = JSON.parse(localStorage.getItem('bookmarks') ?? '[]');

      if (!Array.isArray(raw)) return [];

      const isNewFormat = raw.every(
        (b) =>
          b &&
          typeof b === 'object' &&
          typeof b.id === 'string' &&
          typeof b.category === 'string'
      );

      if (isNewFormat) return raw as TBookmark[];
      localStorage.removeItem('bookmarks');
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
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

  return [bookmarks, toggleBookmark];
}
