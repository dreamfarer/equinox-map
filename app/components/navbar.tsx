'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';
import styles from './navbar.module.css';
import Group from './navbar/group';
import { ListDashes, BookmarkSimple, CaretLeft } from '@phosphor-icons/react';
import { useMarkerLayerContext } from '../context/marker-layer';
import { TMenu } from '@/types/menu';

interface Props {
  selectedMenu: TMenu;
  isMenuOpen: boolean;
  onSelectMenu: (menu: TMenu) => void;
  onToggleMenu: () => void;
}

const Navbar: React.FC<Props> = ({
  selectedMenu,
  isMenuOpen,
  onSelectMenu,
  onToggleMenu,
}) => {
  const { setShowOnlyBookmarks } = useMarkerLayerContext();

  useEffect(() => {
    if (selectedMenu == 'bookmarks') {
      setShowOnlyBookmarks(true);
    } else {
      setShowOnlyBookmarks(false);
    }
  }, [selectedMenu, setShowOnlyBookmarks]);

  return (
    <div className={styles.navbar}>
      <Group>
        <button className={`${styles.button} ${styles.logo}`} aria-label="Home">
          <Image loading="lazy" fill alt="Logo" src="/logo.svg" />
        </button>

        <button
          onClick={() => onSelectMenu('filter')}
          className={`${styles.button} ${
            selectedMenu === 'filter' ? styles.inactive : styles.active
          }`}
          aria-label="Show filter"
        >
          <ListDashes size="2em" />
        </button>

        <button
          onClick={() => onSelectMenu('bookmarks')}
          className={`${styles.button} ${
            selectedMenu === 'bookmarks' ? styles.inactive : styles.active
          }`}
          aria-label="Show bookmarks"
        >
          <BookmarkSimple size="2em" />
        </button>
      </Group>

      <Group>
        <button
          onClick={onToggleMenu}
          className={`${styles.caret} ${
            !isMenuOpen ? styles.inactive : styles.active
          }`}
          aria-label={isMenuOpen ? 'Hide menu' : 'Show menu'}
        >
          <CaretLeft size="2em" className="" />
        </button>
      </Group>
    </div>
  );
};

export default Navbar;
