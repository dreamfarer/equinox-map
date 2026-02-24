'use client';

import { useMenuState } from '@/app/context/menu-state-context';
import { InfoIcon, ListDashesIcon } from '@phosphor-icons/react';
import styles from '@/app/components/navbar.module.css';

export default function Navbar() {
    const { activeMenuName, isMenuOpen, setIsMenuOpen, setActiveMenuName } =
        useMenuState();

    return (
        <div className={styles.navbar}>
            <button
                onClick={() => {
                    setActiveMenuName('filter');
                    if (activeMenuName !== 'filter' && isMenuOpen) return;
                    setIsMenuOpen((prev) => !prev);
                }}
                className={`${styles.button} ${
                    activeMenuName === 'filter' && isMenuOpen
                        ? styles.inactive
                        : styles.active
                }`}
                aria-label="Show filter"
            >
                <ListDashesIcon size="2em" />
            </button>
            <button
                onClick={() => {
                    setActiveMenuName('information');
                    if (activeMenuName !== 'information' && isMenuOpen) return;
                    setIsMenuOpen((prev) => !prev);
                }}
                className={`${styles.button} ${
                    activeMenuName === 'information' && isMenuOpen
                        ? styles.inactive
                        : styles.active
                }`}
                aria-label="Show filter"
            >
                <InfoIcon size="2em" />
            </button>
        </div>
    );
}
