'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { TMarkerFeatureCollection } from '@/types/marker';
import {
  categories,
  TActiveCategories,
  TCategory,
} from '@/types/category';
import { MarkerContext } from '@/app/context/marker-context';
import {
  loadCollectedMarkerIdsFromLocalStorage,
  saveCollectedMarkerIdsToLocalStorage,
} from '@/lib/collected-marker-utility';
import { TPopups } from '@/types/popup';

/**
 * Activate all categories on interactive map startup
 */
function getDefaultEnabledCategories(
  categories: readonly TCategory[]
): TActiveCategories {
  return Object.fromEntries(
    categories.map((c) => [c, true])
  ) as TActiveCategories;
}

/**
 * Context provider for managing markers
 */
export function MarkerContextProvider({
  children,
  markers: markers,
  popups: popups,
}: {
  children: ReactNode;
  markers: TMarkerFeatureCollection;
  popups: TPopups
}) {

  const allMarkers: TMarkerFeatureCollection = markers
  const allPopups = popups

  const [visibleMarkerIds, setVisibleMarkerIds] = useState<string[]>([])
  const [collectedMarkerIds, setCollectedMarkerIds] = useState<string[]>(
    loadCollectedMarkerIdsFromLocalStorage
  );
  const [activeCategories, setActiveCategories] =
    useState<TActiveCategories>(getDefaultEnabledCategories(categories));

  const toggleCategory = (category: TCategory) => {
    setActiveCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleCollectedMarkerIds = (id: string) => {
    setCollectedMarkerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearCollectedMarkerIds = () => setCollectedMarkerIds([]);

  useEffect(() => {
    saveCollectedMarkerIdsToLocalStorage(collectedMarkerIds);
  }, [collectedMarkerIds]);

  const value = useMemo(
    () => ({
      visibleMarkerIds,
      collectedMarkerIds,
      activeCategories,
      toggleCategory,
      toggleCollectedMarkerIds,
      clearCollectedMarkerIds,
    }),
    [visibleMarkerIds, collectedMarkerIds, activeCategories]
  );

  return <MarkerContext value={value}>{children}</MarkerContext>;
}
