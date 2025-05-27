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
import { useMapInstance } from '../hooks/use-map-instance';
import { useMapInitialization } from '../hooks/use-map-initialization';
import { useFilterUpdates } from '../hooks/use-filter-updates';
import { useFlyToMarker } from '../hooks/use-fly-to-marker';
import { TMarkerLayerContext } from '@/types/marker-layer-context';
import { TPopups } from '@/types/popup';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { useMapPopupHandler } from '../hooks/use-popup-handler';
import { TCategory } from '@/types/category';
import { Maps } from '@/types/map';
import { loadData } from '@/lib/marker-layer-utility';

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
  const [maps, setMaps] = useState<Maps | null>(null);
  const [filteredPopups, setFilteredPopups] = useState<TPopups>({});
  const [activeCategories, setActiveCategories] = useState<TCategory[]>([]);

  useEffect(() => {
    const load = async () => {
      const { markers, popups, maps } = await loadData();
      setMarkers(markers);
      setPopups(popups);
      setMaps(maps);
    };
    load();
  }, []);

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

  useMapInitialization(map, markers);

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
      maps,
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
      maps,
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
