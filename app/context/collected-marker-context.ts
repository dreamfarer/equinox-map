'use client';

import { createContext } from 'react';

type TCollectedMarkerContext = {
  collectedMarkerIds: string[];
  toggleCollectedMarkerIds: (id: string) => void;
  clearCollectedMarkerIds: () => void;
};

/**
 * Context for managing ignored marker IDs.
 */
export const CollectedMarkerContext = createContext<TCollectedMarkerContext>({
  collectedMarkerIds: [],
  toggleCollectedMarkerIds: () =>
    console.warn('toggleIgnore used without provider'),
  clearCollectedMarkerIds: () =>
    console.warn('clearBookmarks used without provider'),
});
