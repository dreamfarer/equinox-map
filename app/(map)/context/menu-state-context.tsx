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
import { useLocalStorage } from '@/app/(map)/hooks/use-local-storage';

// Migrate users who have the old boolean flag set.
if (typeof window !== 'undefined') {
    const old = localStorage.getItem('isTutorialDone');
    if (old !== null) {
        localStorage.removeItem('isTutorialDone');
        if (old === 'true') {
            localStorage.setItem(
                'tutorialDoneAt',
                JSON.stringify(new Date().toISOString())
            );
        }
    }
}

type MenuStateContextValue = {
    isMenuOpen: boolean;
    setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
    activeMenuName: string;
    setActiveMenuName: Dispatch<SetStateAction<string>>;
    tutorialDoneAt: string | undefined;
    setTutorialDoneAt: (next: string | undefined) => void;
    whatsNewSeenAt: string | undefined;
    setWhatsNewSeenAt: (next: string | undefined) => void;
    isLocalStorageReady: boolean;
    isMobile: boolean;
    setIsMobile: Dispatch<SetStateAction<boolean>>;
};

const MenuStateContext = createContext<MenuStateContextValue | undefined>(
    undefined
);

export function MenuStateProvider({ children }: { children: ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [activeMenuName, setActiveMenuName] = useState('filter');
    const [isMobile, setIsMobile] = useState(false);
    const [tutorialDoneAt, setTutorialDoneAt, isLocalStorageReady] =
        useLocalStorage<string>('tutorialDoneAt');
    const [whatsNewSeenAt, setWhatsNewSeenAt] =
        useLocalStorage<string>('whatsNewSeenAt');

    const contextValue = useMemo<MenuStateContextValue>(
        () => ({
            isMenuOpen,
            setIsMenuOpen,
            activeMenuName,
            setActiveMenuName,
            tutorialDoneAt,
            setTutorialDoneAt,
            whatsNewSeenAt,
            setWhatsNewSeenAt,
            isLocalStorageReady,
            isMobile,
            setIsMobile,
        }),
        [
            isMenuOpen,
            activeMenuName,
            tutorialDoneAt,
            setTutorialDoneAt,
            whatsNewSeenAt,
            setWhatsNewSeenAt,
            isLocalStorageReady,
            isMobile,
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
