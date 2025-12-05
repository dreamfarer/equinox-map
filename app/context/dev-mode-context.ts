'use client';

import { createContext, useContext } from 'react';

type TDevModeContext = {
  isDevMode: boolean;
  setDevMode: (activate: boolean) => void;
};

/**
 * Context for managing the development mode.
 */
export const DevModeContext = createContext<TDevModeContext | null>(null);
export function useDevModeContext() {
  const context = useContext(DevModeContext);
  if (!context)
    throw new Error(
      'useDevModeContext must be used inside <DevModeContextProvider>'
    );
  return context;
}
