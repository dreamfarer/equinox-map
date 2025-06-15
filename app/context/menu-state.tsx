'use client';
import { createContext, useContext, useMemo, useState } from 'react';

type MenuState = {
  isMenuOpen: boolean;
  activeMenuName: string;
  toggleMenu: () => void;
  setMenuOpen: (open: boolean) => void;
  setActiveMenuName: (activeMenuName: string) => void;
};

const MenuStateContext = createContext<MenuState | null>(null);

export function MenuStateProvider({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeMenuName, SetMenuName] = useState('filter');

  const contextValue = useMemo(
    () => ({
      isMenuOpen,
      activeMenuName,
      toggleMenu: () => setIsMenuOpen((v) => !v),
      setMenuOpen: (v: boolean) => setIsMenuOpen(v),
      setActiveMenuName: (v: string) => SetMenuName(v),
    }),
    [isMenuOpen, activeMenuName]
  );

  return (
    <MenuStateContext.Provider value={contextValue}>
      {children}
    </MenuStateContext.Provider>
  );
}

export function useMenuState() {
  const context = useContext(MenuStateContext);
  if (!context)
    throw new Error('useMenuState must be used within <MenuStateProvider>');
  return context;
}
