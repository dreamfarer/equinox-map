'use client';

import { createContext } from 'react';

type TIgnoredMarkerContext = {
  ignoredMarkerIds: string[];
  toggleIgnoredMarkerIds: (id: string) => void;
  clearIgnoredMarkerIds: () => void;
};

/**
 * Context for managing ignored marker IDs.
 */
export const IgnoredMarkerContext = createContext<TIgnoredMarkerContext>({
  ignoredMarkerIds: [],
  toggleIgnoredMarkerIds: () =>
    console.warn('toggleIgnore used without provider'),
  clearIgnoredMarkerIds: () =>
    console.warn('clearBookmarks used without provider'),
});
