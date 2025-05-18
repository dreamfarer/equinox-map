import { useCallback, useState } from 'react';

export function useVisibleIds(): [
  string[] | null,
  (ids: string[] | null) => void,
] {
  const [visibleIds, setVisibleIds] = useState<string[] | null>(null);
  const showOnlyMarkers = useCallback(
    (ids: string[] | null) => setVisibleIds(ids),
    [],
  );
  return [visibleIds, showOnlyMarkers];
}
