'use client';

import { ReactNode, useMemo, useState, useEffect } from 'react';
import { IgnoredMarkerContext } from '@/app/context/ignored-marker-context';
import {
  loadIgnoredMarkerIdsFromLocalStorage,
  saveIgnoredMarkerIdsToLocalStorage,
} from '@/lib/ignored-marker-utility';

/**
 * Context provider for managing ignored marker IDs.
 */
export function IgnoredMarkerProvider({ children }: { children: ReactNode }) {
  const [ignoredMarkerIds, setIgnoredMarkerIds] = useState<string[]>(
    loadIgnoredMarkerIdsFromLocalStorage
  );

  const toggleIgnoredMarkerIds = (id: string) => {
    setIgnoredMarkerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearIgnoredMarkerIds = () => setIgnoredMarkerIds([]);

  useEffect(() => {
    saveIgnoredMarkerIdsToLocalStorage(ignoredMarkerIds);
  }, [ignoredMarkerIds]);

  const value = useMemo(
    () => ({
      ignoredMarkerIds,
      toggleIgnoredMarkerIds,
      clearIgnoredMarkerIds,
    }),
    [ignoredMarkerIds]
  );

  return <IgnoredMarkerContext value={value}>{children}</IgnoredMarkerContext>;
}
