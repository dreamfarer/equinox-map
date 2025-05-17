import { useEffect, useState } from 'react';

export function useBookmarks(): [string[], (id: string) => void] {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('bookmarks') ?? '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id)
        ? prev.filter((b) => b !== id)
        : [...prev, id];
      window.dispatchEvent(
        new CustomEvent('bookmark-changed', {
          detail: {
            id,
            isBookmarked: next.includes(id),
            bookmarks: next,
          },
        }),
      );

      return next;
    });
  };

  return [bookmarks, toggleBookmark];
}
