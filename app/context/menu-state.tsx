'use client';
import { createContext, useContext, useState } from 'react';

type MenuState = {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  setMenuOpen: (open: boolean) => void;
};

const MenuStateContext = createContext<MenuState | null>(null);

export function MenuStateProvider({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  return (
    <MenuStateContext.Provider
      value={{
        isMenuOpen,
        toggleMenu: () => setIsMenuOpen((v) => !v),
        setMenuOpen: (v) => setIsMenuOpen(v),
      }}
    >
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
