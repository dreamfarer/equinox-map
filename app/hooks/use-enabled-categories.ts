import { categories, TCategory } from '@/types/category';
import { useCallback, useState } from 'react';

export function useEnabledCategories(): [
  Record<TCategory, boolean>,
  (category: TCategory) => void,
] {
  const [enabled, setEnabled] = useState<Record<TCategory, boolean>>(
    Object.fromEntries(categories.map((c) => [c, true])) as Record<
      TCategory,
      boolean
    >
  );
  const toggleCategory = useCallback(
    (category: TCategory) =>
      setEnabled((prev) => ({ ...prev, [category]: !prev[category] })),
    []
  );
  return [enabled, toggleCategory];
}
