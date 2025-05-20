import { useCallback, useState } from 'react';
import { TBookmark } from '@/types/bookmark';

export function useVisibleIds(): [
  string[] | null,
  (bookmarks: TBookmark[] | null) => void,
] {
  const [visibleIds, setVisibleIds] = useState<string[] | null>(null);

  const showOnlyBookmarks = useCallback((bookmarks: TBookmark[] | null) => {
    if (!bookmarks) {
      setVisibleIds(null);
    } else {
      const ids = bookmarks.map((b) => b.id);
      setVisibleIds(ids);
    }
  }, []);

  return [visibleIds, showOnlyBookmarks];
}
