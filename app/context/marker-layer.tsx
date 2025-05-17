'use client';
import { createContext, useContext, useState, useMemo } from 'react';
import { MergedMarker } from '../../types/marker';
import { MarkerLayerContextType } from '@/types/marker-layer-context';
import { useEnabledCategories } from '../hooks/use-enabled-categories';
import { useBookmarks } from '../hooks/use-bookmarks';
import { useMapInstance } from '../hooks/use-map-instance';
import { useFlyToMarker } from '../hooks/use-fly-to-marker';
import { useVisibleIds } from '../hooks/use-visible-ids';
import { useMapInitialization } from '../hooks/use-map-initialization';
import { useFilterUpdates } from '../hooks/use-filter-updates';

const MarkerLayerContext = createContext<MarkerLayerContextType | null>(null);

export const useMarkerLayerContext = () => {
  const context = useContext(MarkerLayerContext);
  if (!context)
    throw new Error(
      'useMarkerLayerContext must be used inside MarkerLayerProvider',
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
  const [visibleIds, showOnlyMarkers] = useVisibleIds();
  const [markers, setMarkers] = useState<MergedMarker[]>([]);

  useMapInitialization(map, setMarkers, bookmarks, toggleBookmark);
  useFilterUpdates(map, enabled, visibleIds, markers);

  const flyToMarker = useFlyToMarker(map, markers);
  const contextValue = useMemo<MarkerLayerContextType>(
    () => ({
      enabled,
      toggleCategory,
      setMapInstance,
      markers,
      flyToMarker,
      showOnlyMarkers,
      bookmarks,
      toggleBookmark,
    }),
    [
      enabled,
      markers,
      bookmarks,
      flyToMarker,
      showOnlyMarkers,
      toggleBookmark,
      toggleCategory,
      setMapInstance,
    ],
  );

  return (
    <MarkerLayerContext.Provider value={contextValue}>
      {children}
    </MarkerLayerContext.Provider>
  );
}
