'use client';

import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
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

    return (
        <DevModeContext value={{ isDevMode, setIsDevMode }}>
            {children}
        </DevModeContext>
    );
}

export function useDevMode() {
    const context = useContext(DevModeContext);
    if (!context)
        throw new Error('useDevMode must be used inside <DevModeProvider>');
    return context;
}
