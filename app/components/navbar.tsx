'use client';

import { useMenuState } from '@/app/context/menu-state-context';
import { InfoIcon, ListDashesIcon } from '@phosphor-icons/react';
import styles from '@/app/components/navbar.module.css';

export default function Navbar() {
    const { activeMenuName, isMenuOpen, setIsMenuOpen, setActiveMenuName } =
        useMenuState();

    const toggleMenu = (target: 'filter' | 'information') => {
        if (isMenuOpen && activeMenuName !== target) {
            setActiveMenuName(target);
            return;
        }
        setActiveMenuName(target);
        setIsMenuOpen((prev) => !prev);
    };

    return (
        <div className={styles.navbar}>
            <button
                id="filterButton"
                onClick={() => toggleMenu('filter')}
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
                id="informationButton"
                onClick={() => toggleMenu('information')}
                className={`${styles.button} ${
                    activeMenuName === 'information' && isMenuOpen
                        ? styles.inactive
                        : styles.active
                }`}
                aria-label="Show info"
            >
                <InfoIcon size="2em" />
            </button>
        </div>
    );
}
