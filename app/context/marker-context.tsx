'use client';

import { createContext, useContext } from 'react';
import { TCategory } from '@/types/category';

type TMarkerContext = {
  visibleMarkerIds: string[];
  collectedMarkerIds: string[];
  activeCategories: Record<TCategory, boolean>;
  toggleCategory: (category: TCategory) => void;
  toggleCollectedMarkerIds: (id: string) => void;
  clearCollectedMarkerIds: () => void;
};

/**
 * Context for managing markers
 */
export const MarkerContext = createContext<TMarkerContext | null>(null);
export function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context)
    throw new Error(
      'useMarkerContext must be used inside <MarkerContextProvider>'
    );
  return context;
}
