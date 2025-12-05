'use client';

import { ReactNode, useMemo, useState } from 'react';
import { DevModeContext } from '@/app/context/dev-mode-context';

/**
 * Context provider for managing the development mode.
 */
export function DevModeContextProvider({ children }: { children: ReactNode }) {
  const [isDevMode, setIsDevMode] = useState(false);

  const setDevMode = (activate: boolean) => setIsDevMode(activate);

  const value = useMemo(
    () => ({
      isDevMode,
      setDevMode,
    }),
    [isDevMode]
  );

  return <DevModeContext value={value}>{children}</DevModeContext>;
}
