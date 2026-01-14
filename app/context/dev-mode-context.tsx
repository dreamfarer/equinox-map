'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type DevMode = {
    isDevMode: boolean;
    setDevMode: (activate: boolean) => void;
};

const DevModeContext = createContext<DevMode | null>(null);

export function DevModeProvider({ children }: { children: React.ReactNode }) {
    const [isDevMode, setIsDevMode] = useState(false);

    const contextValue = useMemo<DevMode>(
        () => ({
            isDevMode,
            setDevMode: (v: boolean) => setIsDevMode(v),
        }),
        [isDevMode]
    );

    return (
        <DevModeContext.Provider value={contextValue}>
            {children}
        </DevModeContext.Provider>
    );
}

export function useDevMode() {
    const context = useContext(DevModeContext);
    if (!context)
        throw new Error('useDevMode must be used inside <DevModeProvider>');
    return context;
}
