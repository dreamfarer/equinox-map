'use client';

import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useEnabledCategories } from '../hooks/use-enabled-categories';
import { useFilterUpdates } from '../hooks/use-filter-updates';
import { TPopups } from '@/types/popup';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { useMapPopupHandler } from '../hooks/use-popup-handler';
import { TCategory } from '@/types/category';
import { useMapContext } from './map-context';
import { loadMarkers } from '@/lib/marker-utility';
import { usePopupContext } from './popup-context';
import { useBookmarkContext } from './bookmark-context';

type TMarkerContext = {
  enabled: Record<TCategory, boolean>;
  markers: TMarkerFeatureCollection | null;
  toggleCategory: (category: TCategory) => void;
};

const MarkerContext = createContext<TMarkerContext | null>(null);

export function MarkerProvider({ children }: { children: React.ReactNode }) {
  const { mapInstance } = useMapContext();
  const { popups } = usePopupContext();
  const { bookmarkIds, toggleBookmark, bookmarkedMarkerIds } =
    useBookmarkContext();

  const [enabled, toggleCategory] = useEnabledCategories();
  const [markers, setMarkers] = useState<TMarkerFeatureCollection | null>(null);
  const [filteredPopups, setFilteredPopups] = useState<TPopups>({});
  const [activeCategories, setActiveCategories] = useState<TCategory[]>([]);

  useEffect(() => {
    loadMarkers().then(setMarkers);
  }, []);

  useFilterUpdates(
    mapInstance,
    enabled,
    bookmarkedMarkerIds,
    popups,
    (result) => {
      setFilteredPopups(result.filtered);
      setActiveCategories(result.activeCategories);
    }
  );

  useMapPopupHandler(
    mapInstance,
    filteredPopups,
    bookmarkIds,
    toggleBookmark,
    activeCategories,
    bookmarkedMarkerIds
  );

  const contextValue = useMemo<TMarkerContext>(
    () => ({
      enabled,
      markers,
      toggleCategory,
    }),
    [enabled, markers, toggleCategory]
  );

  return (
    <MarkerContext.Provider value={contextValue}>
      {children}
    </MarkerContext.Provider>
  );
}

export function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context)
    throw new Error('useMarkerContext must be used inside <MarkerProvider>');
  return context;
}
