'use client';

import { useCallback } from 'react';
import { categories } from '@/types/category';
import { useMenuState } from '@/app/context/menu-state-context';
import { useBookmarkContext } from '@/app/context/bookmark-context';
import { useFilterContext } from '@/app/context/filter-context';
import styles from '@/app/components/overlay.module.css';

export default function Overlay() {
    const { clearBookmarks } = useBookmarkContext();
    const { activeMenuName } = useMenuState();
    const { setActiveCategories } = useFilterContext();

    const enableAll = useCallback(() => {
        setActiveCategories((prev) => {
            const next = { ...prev };
            for (const cat of categories) {
                next[cat] = true;
            }
            return next;
        });
    }, [setActiveCategories]);

    const disableAll = useCallback(() => {
        setActiveCategories((prev) => {
            const next = { ...prev };
            for (const cat of categories) {
                next[cat] = false;
            }
            return next;
        });
    }, [setActiveCategories]);

    return (
        <div className={styles.overlay}>
            {activeMenuName === 'bookmarks' ? (
                <button onClick={clearBookmarks} className={styles.button}>
                    Unbookmark All
                </button>
            ) : (
                <>
                    <button onClick={enableAll} className={styles.button}>
                        Enable All
                    </button>
                    <button onClick={disableAll} className={styles.button}>
                        Disable All
                    </button>
                </>
            )}
        </div>
    );
}
