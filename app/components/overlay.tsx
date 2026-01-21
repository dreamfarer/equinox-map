'use client';

import { useCallback } from 'react';
import { categories } from '@/types/category';
import { useFilterContext } from '@/app/context/filter-context';
import styles from '@/app/components/overlay.module.css';

export default function Overlay() {
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
            <>
                <button onClick={enableAll} className={styles.button}>
                    Enable All
                </button>
                <button onClick={disableAll} className={styles.button}>
                    Disable All
                </button>
            </>
        </div>
    );
}
