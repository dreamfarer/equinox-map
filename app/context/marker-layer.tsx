'use client';
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useEnabledCategories } from '../hooks/use-enabled-categories';
import { useBookmarks } from '../hooks/use-bookmarks';
import { useMapInstance } from '../hooks/use-map-instance';
import { useVisibleIds } from '../hooks/use-visible-ids';
import { useMapInitialization } from '../hooks/use-map-initialization';
import { useFilterUpdates } from '../hooks/use-filter-updates';
import { useFlyToMarker } from '../hooks/use-fly-to-marker';
import { TMarkerLayerContext } from '@/types/marker-layer-context';
import { TPopup } from '@/types/popup';
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
  const [bookmarks, toggleBookmark] = useBookmarks();
  const [map, setMapInstance] = useMapInstance();
  const [visibleIds, showOnlyBookmarks] = useVisibleIds();
  const [popups, setPopups] = useState<TPopup[]>([]);
  const [markers, setMarkers] = useState<TMarkerFeatureCollection | null>(null);
  const [filteredPopups, setFilteredPopups] = useState<TPopup[]>([]);
  const [activeCategories, setActiveCategories] = useState<TCategory[]>([]);

  const handleFilterResult = useCallback(
    (result: { filtered: TPopup[]; activeCategories: TCategory[] }) => {
      setFilteredPopups(result.filtered);
      setActiveCategories(result.activeCategories);
    },
    []
  );

  useMapInitialization(map, setPopups, setMarkers);
  useFilterUpdates(map, enabled, visibleIds, popups, handleFilterResult);
  useMapPopupHandler(
    map,
    filteredPopups,
    bookmarks,
    toggleBookmark,
    activeCategories,
    visibleIds
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
      bookmarks,
      toggleBookmark,
    }),
    [
      enabled,
      popups,
      markers,
      flyToMarker,
      showOnlyBookmarks,
      bookmarks,
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
