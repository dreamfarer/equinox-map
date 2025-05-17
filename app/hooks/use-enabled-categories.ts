import { markerCategories, MarkerCategory } from '@/types/marker';
import { useCallback, useState } from 'react';

export function useEnabledCategories(): [
  Record<MarkerCategory, boolean>,
  (cat: MarkerCategory) => void,
] {
  const [enabled, setEnabled] = useState<Record<MarkerCategory, boolean>>(
    Object.fromEntries(markerCategories.map((c) => [c, true])) as Record<
      MarkerCategory,
      boolean
    >,
  );
  const toggleCategory = useCallback(
    (cat: MarkerCategory) =>
      setEnabled((prev) => ({ ...prev, [cat]: !prev[cat] })),
    [],
  );
  return [enabled, toggleCategory];
}
