'use client';
import { createContext, useContext, useState } from 'react';

type DevMode = {
  isDevMode: boolean;
  setDevMode: (activate: boolean) => void;
};

const DevModeContext = createContext<DevMode | null>(null);

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const [isDevMode, setIsDevMode] = useState(false);

  return (
    <DevModeContext.Provider
      value={{
        isDevMode,
        setDevMode: (v) => setIsDevMode(v),
      }}
    >
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  const context = useContext(DevModeContext);
  if (!context)
    throw new Error('useDevMode must be used within <DevModeProvider>');
  return context;
}
