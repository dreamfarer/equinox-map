'use client';

import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useMemo,
    useState,
} from 'react';

type DevModeContextValue = {
    isDevMode: boolean;
    setIsDevMode: Dispatch<SetStateAction<boolean>>;
};

const DevModeContext = createContext<DevModeContextValue | undefined>(
    undefined
);

export function DevModeProvider({ children }: { children: ReactNode }) {
    const [isDevMode, setIsDevMode] = useState(false);

    const contextValue = useMemo<DevModeContextValue>(
        () => ({
            isDevMode,
            setIsDevMode,
        }),
        [isDevMode]
    );

    return <DevModeContext value={contextValue}>{children}</DevModeContext>;
}

export function useDevMode() {
    const context = useContext(DevModeContext);
    if (!context)
        throw new Error('useDevMode must be used inside <DevModeProvider>');
    return context;
}
