'use client';
import React, { useState } from 'react';
import Filter from './components/filter';
import MapWrapper from './components/map-wrapper';
import styles from './page.module.css';
import { MarkerLayerProvider } from './context/marker-layer';
import Navbar from './components/navbar';
import Bookmarks from './components/bookmarks';
import { MenuType } from '@/types/menu';

export default function Home() {
  const [selectedMenu, setSelectedMenu] = useState<MenuType>('filter');
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const openMenu = (menu: MenuType) => {
    setSelectedMenu(menu);
  };

  const toggleMenu = () => {
    setIsMenuOpen((v) => !v);
  };

  return (
    <MarkerLayerProvider>
      <div className={styles.home}>
        <Navbar
          selectedMenu={selectedMenu}
          isMenuOpen={isMenuOpen}
          onSelectMenu={openMenu}
          onToggleMenu={toggleMenu}
        />
        {isMenuOpen && selectedMenu == 'filter' && <Filter />}
        {isMenuOpen && selectedMenu == 'bookmarks' && <Bookmarks />}
        <MapWrapper />
      </div>
    </MarkerLayerProvider>
  );
}
