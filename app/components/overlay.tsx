'use client';

import { useCallback } from 'react';
import { useMarkerContext } from '@/app/context/marker-context';
import type { TCategory } from '@/types/category';
import { useMenuState } from '@/app/context/menu-state-context';
import { useBookmarkContext } from '@/app/context/bookmark-context';
import styles from '@/app/components/overlay.module.css';

export default function Overlay() {
    const { enabledMarkerCategories, toggleMarkerCategory } =
        useMarkerContext();
    const { clearBookmarks } = useBookmarkContext();
    const { activeMenuName } = useMenuState();

    const enableAll = useCallback(() => {
        (
            Object.entries(enabledMarkerCategories) as [TCategory, boolean][]
        ).forEach(([categoryId, isEnabled]) => {
            if (!isEnabled) toggleMarkerCategory(categoryId);
        });
    }, [enabledMarkerCategories, toggleMarkerCategory]);

    const disableAll = useCallback(() => {
        (
            Object.entries(enabledMarkerCategories) as [TCategory, boolean][]
        ).forEach(([categoryId, isEnabled]) => {
            if (isEnabled) toggleMarkerCategory(categoryId);
        });
    }, [enabledMarkerCategories, toggleMarkerCategory]);

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
