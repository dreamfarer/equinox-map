'use client';

import { ReactNode, useMemo, useState, useEffect } from 'react';
import { CollectedMarkerContext } from '@/app/context/collected-marker-context';
import {
  loadCollectedMarkerIdsFromLocalStorage,
  saveCollectedMarkerIdsToLocalStorage,
} from '@/lib/collected-marker-utility';

/**
 * Context provider for managing ignored marker IDs.
 */
export function CollectedMarkerProvider({ children }: { children: ReactNode }) {
  const [collectedMarkerIds, setCollectedMarkerIds] = useState<string[]>(
    loadCollectedMarkerIdsFromLocalStorage
  );

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
      collectedMarkerIds,
      toggleCollectedMarkerIds,
      clearCollectedMarkerIds,
    }),
    [collectedMarkerIds]
  );

  return (
    <CollectedMarkerContext value={value}>{children}</CollectedMarkerContext>
  );
}
