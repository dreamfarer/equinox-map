'use client';

import { useMenuState } from '@/app/(map)/context/menu-state-context';
import { InfoIcon, ListDashesIcon, TShirtIcon } from '@phosphor-icons/react';
import styles from '@/app/(map)/components/sidebar/navigation/navbar.module.css';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
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

    const isFilterOpen = activeMenuName === 'filter' && isMenuOpen;
    const isInformationOpen = activeMenuName === 'information' && isMenuOpen;

    return (
        <div className={styles.navbar}>
            <button
                id="filterButton"
                onClick={() => toggleMenu('filter')}
                className={`outline ${isFilterOpen ? '' : styles.inactive}`}
                style={{ aspectRatio: 1 }}
                aria-label="Show filter"
            >
                <ListDashesIcon size="2em" />
            </button>
            <button
                id="informationButton"
                onClick={() => toggleMenu('information')}
                className={`outline ${isInformationOpen ? '' : styles.inactive}`}
                style={{ aspectRatio: 1 }}
                aria-label="Show info"
            >
                <InfoIcon size="2em" />
            </button>
            <button
                id="navigateToDatabaseButton"
                onClick={() => router.push('/database')}
                className={`outline ${styles.inactive}`}
                style={{ aspectRatio: 1 }}
                aria-label="Navigate to the database"
            >
                <TShirtIcon size="2em" />
            </button>
        </div>
    );
}
