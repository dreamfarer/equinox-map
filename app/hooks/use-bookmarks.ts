import { useCallback, useState } from 'react';

export function useBookmarks(): [string[], (id: string) => void] {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id)
        ? prev.filter((b) => b !== id)
        : [...prev, id];
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookmarks', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return [bookmarks, toggleBookmark];
}
