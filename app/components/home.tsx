'use client';
import React, { useState } from 'react';
import styles from './home.module.css';
import { TMenu } from '@/types/menu';
import { MarkerLayerProvider } from '../context/marker-layer';
import Navbar from './navbar';
import Filter from './filter';
import Bookmarks from './bookmarks';
import MapWrapper from './map-wrapper';
import Overlay from './overlay';

export default function Home() {
  const [selectedMenu, setSelectedMenu] = useState<TMenu>('filter');
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const openMenu = (menu: TMenu) => {
    setSelectedMenu(menu);
  };

  const toggleMenu = () => {
    setIsMenuOpen((v) => !v);
  };

  return (
    <MarkerLayerProvider>
      <div className={styles.home}>
        <Overlay />
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
