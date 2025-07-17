'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { useEnabledCategories } from '../hooks/use-enabled-categories';
import { useBookmarkManager } from '../hooks/use-bookmark-manager';
import { useMapInitialization } from '../hooks/use-map-initialization';
import { useFilterUpdates } from '../hooks/use-filter-updates';
import { useFlyToMarker } from '../hooks/use-fly-to-marker';
import { TMarkerContext } from '@/types/marker-layer-context';
import { TPopups } from '@/types/popup';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { useMapPopupHandler } from '../hooks/use-popup-handler';
import { TCategory } from '@/types/category';
import { loadData } from '@/lib/marker-layer-utility';
import { useMapContext } from './map-context';

const MarkerContext = createContext<TMarkerContext | null>(null);

export function MarkerProvider({ children }: { children: React.ReactNode }) {
  const [enabled, toggleCategory] = useEnabledCategories();
  const [popups, setPopups] = useState<TPopups>({});
  const [markers, setMarkers] = useState<TMarkerFeatureCollection | null>(null);
  const [filteredPopups, setFilteredPopups] = useState<TPopups>({});
  const [activeCategories, setActiveCategories] = useState<TCategory[]>([]);
  const { mapInstance } = useMapContext();

  useEffect(() => {
    const load = async () => {
      const { markers, popups } = await loadData();
      setMarkers(markers);
      setPopups(popups);
    };
    load();
  }, []);

  const {
    bookmarkIds,
    categoryBookmarkMap,
    bookmarkedMarkerIds,
    toggleBookmark,
    toggleBookmarks,
    clearBookmarks,
  } = useBookmarkManager(popups);

  const handleFilterResult = useCallback(
    (result: { filtered: TPopups; activeCategories: TCategory[] }) => {
      setFilteredPopups(result.filtered);
      setActiveCategories(result.activeCategories);
    },
    []
  );

  useMapInitialization(mapInstance, markers);

  useFilterUpdates(
    mapInstance,
    enabled,
    bookmarkedMarkerIds,
    popups,
    handleFilterResult
  );

  useMapPopupHandler(
    mapInstance,
    filteredPopups,
    bookmarkIds,
    toggleBookmark,
    activeCategories,
    bookmarkedMarkerIds
  );

  const flyToMarker = useFlyToMarker(mapInstance, popups, markers);

  const contextValue = useMemo<TMarkerContext>(
    () => ({
      enabled,
      popups,
      markers,
      bookmarkIds,
      categoryBookmarkMap,
      flyToMarker,
      toggleBookmark,
      toggleBookmarks,
      clearBookmarks,
      toggleCategory,
    }),
    [
      enabled,
      popups,
      markers,
      bookmarkIds,
      categoryBookmarkMap,
      flyToMarker,
      toggleBookmark,
      toggleBookmarks,
      clearBookmarks,
      toggleCategory,
    ]
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
    throw new Error('useMarkerContext must be used inside MarkerProvider');
  return context;
}
