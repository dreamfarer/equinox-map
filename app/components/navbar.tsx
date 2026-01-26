'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useMenuState } from '@/app/context/menu-state-context';
import { ListDashesIcon } from '@phosphor-icons/react';
import styles from '@/app/components/navbar.module.css';

export default function Navbar() {
    const { setIsMenuOpen, setActiveMenuName } = useMenuState();
    const segment = usePathname().split('/').filter(Boolean).pop() ?? 'filter';

    useEffect(() => {
        setActiveMenuName(segment);
    }, [segment, setActiveMenuName]);

    return (
        <div className={styles.navbar}>
            <button
                onClick={() => {
                    setActiveMenuName('filter');
                    setIsMenuOpen((prev) => !prev);
                }}
                className={`${styles.button} ${
                    segment === 'filter' ? styles.inactive : styles.active
                }`}
                aria-label="Show filter"
            >
                <ListDashesIcon size="2em" />
            </button>
        </div>
    );
}
