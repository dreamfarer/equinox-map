'use client';

import { ReactNode } from 'react';
import styles from '@/app/components/menu.module.css';
import { useMenuState } from '@/app/context/menu-state-context';

type Props = {
    children: ReactNode;
};

export default function Menu({ children }: Props) {
    const { isMenuOpen } = useMenuState();
    return (
        <div className={styles.menuWrapper}>
            <div
                className={`${styles.menu} ${!isMenuOpen ? styles.closed : ''}`}
            >
                {children}
            </div>
        </div>
    );
}
