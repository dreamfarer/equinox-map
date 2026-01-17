'use client';
import Image from 'next/image';
import styles from './navbar.module.css';
import Group from './navbar/group';
import {
    ListDashesIcon,
    BookmarkSimpleIcon,
    CaretLeftIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useMenuState } from '../context/menu-state-context';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Navbar() {
    const { isMenuOpen, setIsMenuOpen, setActiveMenuName } = useMenuState();
    const segment = usePathname().split('/').filter(Boolean).pop() ?? 'filter';

    useEffect(() => {
        setActiveMenuName(segment);
    }, [segment, setActiveMenuName]);

    return (
        <div className={styles.navbar}>
            <Group>
                <Link
                    href="/filter"
                    scroll={false}
                    className={`${styles.button} ${styles.logo}`}
                    aria-label="Home"
                >
                    <Image loading="lazy" fill alt="Logo" src="/logo.svg" />
                </Link>

                <Link
                    href="/filter"
                    scroll={false}
                    className={`${styles.button} ${
                        segment === 'filter' ? styles.inactive : styles.active
                    }`}
                    aria-label="Show filter"
                >
                    <ListDashesIcon size="2em" />
                </Link>

                <Link
                    href="/bookmarks"
                    scroll={false}
                    className={`${styles.button} ${
                        segment === 'bookmarks'
                            ? styles.inactive
                            : styles.active
                    }`}
                    aria-label="Show bookmarks"
                >
                    <BookmarkSimpleIcon size="2em" />
                </Link>
            </Group>

            <Group>
                <button
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className={`${styles.caret} ${
                        !isMenuOpen ? styles.inactive : styles.active
                    }`}
                    aria-label={isMenuOpen ? 'Hide menu' : 'Show menu'}
                >
                    <CaretLeftIcon size="2em" className="" />
                </button>
            </Group>
        </div>
    );
}
