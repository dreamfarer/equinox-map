'use client';
import { createContext, useContext, ReactNode } from 'react';

const DevModeContext = createContext(false);

export function useDevMode() {
  return useContext(DevModeContext);
}

export function DevModeProvider({ children }: { children: ReactNode }) {
  return (
    <DevModeContext.Provider value={true}>{children}</DevModeContext.Provider>
  );
}
