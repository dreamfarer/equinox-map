'use client';

import { useMenuState } from '@/app/context/menu-state-context';
import { ListDashesIcon } from '@phosphor-icons/react';
import styles from '@/app/components/navbar.module.css';

export default function Navbar() {
    const { activeMenuName, setIsMenuOpen, setActiveMenuName } = useMenuState();

    return (
        <div className={styles.navbar}>
            <button
                onClick={() => {
                    setActiveMenuName('filter');
                    setIsMenuOpen((prev) => !prev);
                }}
                className={`${styles.button} ${
                    activeMenuName === 'filter'
                        ? styles.inactive
                        : styles.active
                }`}
                aria-label="Show filter"
            >
                <ListDashesIcon size="2em" />
            </button>
        </div>
    );
}
