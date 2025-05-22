'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useEnabledCategories } from '../hooks/use-enabled-categories';
import { useBookmarkManager } from '../hooks/use-bookmark-manager';
import { useMapInstance } from '../hooks/use-map-instance';
import { useMapInitialization } from '../hooks/use-map-initialization';
import { useFilterUpdates } from '../hooks/use-filter-updates';
import { useFlyToMarker } from '../hooks/use-fly-to-marker';
import { TMarkerLayerContext } from '@/types/marker-layer-context';
import { TPopups } from '@/types/popup';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { useMapPopupHandler } from '../hooks/use-popup-handler';
import { TCategory } from '@/types/category';

const MarkerLayerContext = createContext<TMarkerLayerContext | null>(null);

export const useMarkerLayerContext = () => {
  const context = useContext(MarkerLayerContext);
  if (!context)
    throw new Error(
      'useMarkerLayerContext must be used inside MarkerLayerProvider'
    );
  return context;
};

export function MarkerLayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, toggleCategory] = useEnabledCategories();
  const [map, setMapInstance] = useMapInstance();
  const [popups, setPopups] = useState<TPopups>({});
  const [markers, setMarkers] = useState<TMarkerFeatureCollection | null>(null);
  const [filteredPopups, setFilteredPopups] = useState<TPopups>({});
  const [activeCategories, setActiveCategories] = useState<TCategory[]>([]);

  const {
    bookmarkIds,
    toggleBookmark,
    bookmarkedMarkerIds,
    showOnlyBookmarks,
    setShowOnlyBookmarks,
  } = useBookmarkManager();

  const handleFilterResult = useCallback(
    (result: { filtered: TPopups; activeCategories: TCategory[] }) => {
      setFilteredPopups(result.filtered);
      setActiveCategories(result.activeCategories);
    },
    []
  );

  useMapInitialization(map, setPopups, setMarkers);

  useFilterUpdates(
    map,
    enabled,
    bookmarkedMarkerIds,
    popups,
    showOnlyBookmarks,
    handleFilterResult
  );

  useMapPopupHandler(
    map,
    filteredPopups,
    bookmarkIds,
    toggleBookmark,
    activeCategories,
    bookmarkedMarkerIds
  );

  const flyToMarker = useFlyToMarker(map, popups, markers);

  const contextValue = useMemo<TMarkerLayerContext>(
    () => ({
      enabled,
      toggleCategory,
      setMapInstance,
      popups,
      markers,
      flyToMarker,
      showOnlyBookmarks,
      setShowOnlyBookmarks,
      bookmarkIds,
      toggleBookmark,
    }),
    [
      enabled,
      popups,
      markers,
      flyToMarker,
      showOnlyBookmarks,
      setShowOnlyBookmarks,
      bookmarkIds,
      toggleBookmark,
      toggleCategory,
      setMapInstance,
    ]
  );

  return (
    <MarkerLayerContext.Provider value={contextValue}>
      {children}
    </MarkerLayerContext.Provider>
  );
}
