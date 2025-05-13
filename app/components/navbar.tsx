'use client';
import type { NextPage } from 'next';
import Image from 'next/image';
import styles from './navbar.module.css';
import Group from './navbar/group';
import { SidebarSimple, ListDashes } from '@phosphor-icons/react';
import { useState } from 'react';

type MenuType = 'none' | 'menu' | 'hidden';

const Navbar: NextPage = () => {
  const [activeMenu, setActiveMenu] = useState<MenuType>('menu');

  return (
    <div className={styles.navbar}>
      <Group>
        <button
          className={`
            ${styles.button} 
            ${styles.logo}
          `}
          aria-label="Home"
        >
          <Image loading="lazy" fill alt="Logo" src="/logo.svg" />
        </button>
        <button
          onClick={() => {
            setActiveMenu('menu');
          }}
          className={`
            ${styles.button} 
            ${activeMenu === 'menu' ? styles.inactive : styles.active}
          `}
          aria-label="Show menu"
        >
          <ListDashes color="currentColor" size="2em" />
        </button>
      </Group>
      <Group>
        <button
          onClick={() => {
            setActiveMenu('hidden');
          }}
          className={`
            ${styles.button} 
            ${activeMenu === 'hidden' ? styles.inactive : styles.active}
          `}
          aria-label="Hide menu"
        >
          <SidebarSimple color="currentColor" size="2em" />
        </button>
      </Group>
    </div>
  );
};

export default Navbar;
