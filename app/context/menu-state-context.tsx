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
import { useLocalStorage } from '@/app/hooks/useLocalStorage';

type MenuStateContextValue = {
    isMenuOpen: boolean;
    setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
    activeMenuName: string;
    setActiveMenuName: Dispatch<SetStateAction<string>>;
    isTutorialDone: boolean | undefined;
    setIsTutorialDone: (next: boolean | undefined) => void;
    isLocalStorageReady: boolean;
};

const MenuStateContext = createContext<MenuStateContextValue | undefined>(
    undefined
);

export function MenuStateProvider({ children }: { children: ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [activeMenuName, setActiveMenuName] = useState('filter');
    const [isTutorialDone, setIsTutorialDone, isLocalStorageReady] =
        useLocalStorage<boolean>('isTutorialDone', false);

    const contextValue = useMemo<MenuStateContextValue>(
        () => ({
            isMenuOpen,
            setIsMenuOpen,
            activeMenuName,
            setActiveMenuName,
            isTutorialDone,
            setIsTutorialDone,
            isLocalStorageReady,
        }),
        [
            isMenuOpen,
            activeMenuName,
            isTutorialDone,
            setIsTutorialDone,
            isLocalStorageReady,
        ]
    );

    return <MenuStateContext value={contextValue}>{children}</MenuStateContext>;
}
export function useMenuState() {
    const context = useContext(MenuStateContext);
    if (!context)
        throw new Error('useMenuState must be used inside <MenuStateProvider>');
    return context;
}
