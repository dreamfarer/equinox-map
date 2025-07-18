'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { useFilterUpdates } from '../hooks/use-filter-updates';
import { TPopups } from '@/types/popup';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { useMapPopupHandler } from '../hooks/use-popup-handler';
import { categories, TCategory } from '@/types/category';
import { useMapContext } from './map-context';
import { loadMarkers } from '@/lib/marker-utility';
import { usePopupContext } from './popup-context';
import { useBookmarkContext } from './bookmark-context';
import { useMapInitialization } from '../hooks/use-map-initialization';
import { ExpressionSpecification } from 'maplibre-gl';

type TMarkerContext = {
  enabledMarkerCategories: Record<TCategory, boolean>;
  markers: TMarkerFeatureCollection | null;
  toggleMarkerCategory: (category: TCategory) => void;
};

const MarkerContext = createContext<TMarkerContext | null>(null);

export function MarkerProvider({ children }: { children: React.ReactNode }) {
  const { mapInstance } = useMapContext();
  const { popups } = usePopupContext();
  const { bookmarkIds, toggleBookmark, bookmarkedMarkerIds } =
    useBookmarkContext();

  const [markers, setMarkers] = useState<TMarkerFeatureCollection | null>(null);
  const [filteredPopups, setFilteredPopups] = useState<TPopups>({});
  const [activeCategories, setActiveCategories] = useState<TCategory[]>([]);
  const [enabledMarkerCategories, setEnabledMarkerCategories] = useState<
    Record<TCategory, boolean>
  >(
    Object.fromEntries(categories.map((c) => [c, true])) as Record<
      TCategory,
      boolean
    >
  );

  const toggleMarkerCategory = useCallback(
    (category: TCategory) =>
      setEnabledMarkerCategories((prev) => ({
        ...prev,
        [category]: !prev[category],
      })),
    []
  );

  useEffect(() => {
    const load = async () => {
      setMarkers(await loadMarkers());
    };
    load();
  }, []);

  useMapInitialization(mapInstance, markers);

  const handleFilterUpdate = useCallback(
    (result: {
      filtered: TPopups;
      expression: ExpressionSpecification | null;
      activeCategories: TCategory[];
    }) => {
      setFilteredPopups(result.filtered);
      setActiveCategories(result.activeCategories);
    },
    []
  );

  useFilterUpdates(
    mapInstance,
    enabledMarkerCategories,
    bookmarkedMarkerIds,
    popups,
    handleFilterUpdate
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
      enabledMarkerCategories,
      markers,
      toggleMarkerCategory,
    }),
    [enabledMarkerCategories, markers, toggleMarkerCategory]
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
