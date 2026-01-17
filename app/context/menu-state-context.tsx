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

type MenuStateContextValue = {
    isMenuOpen: boolean;
    setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
    activeMenuName: string;
    setActiveMenuName: Dispatch<SetStateAction<string>>;
};

const MenuStateContext = createContext<MenuStateContextValue | undefined>(
    undefined
);

export function MenuStateProvider({ children }: { children: ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [activeMenuName, setActiveMenuName] = useState('filter');

    const contextValue = useMemo<MenuStateContextValue>(
        () => ({
            isMenuOpen,
            setIsMenuOpen,
            activeMenuName,
            setActiveMenuName,
        }),
        [isMenuOpen, activeMenuName]
    );

    return <MenuStateContext value={contextValue}>{children}</MenuStateContext>;
}
export function useMenuState() {
    const context = useContext(MenuStateContext);
    if (!context)
        throw new Error('useMenuState must be used inside <MenuStateProvider>');
    return context;
}
