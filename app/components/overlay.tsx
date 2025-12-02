'use client';
import { useCallback } from 'react';
import { useMarkerContext } from '../context/marker-context';
import type { TCategory } from '@/types/category';
import styles from './overlay.module.css';

export default function Overlay() {
  const { enabledMarkerCategories, toggleMarkerCategory } = useMarkerContext();

  const enableAll = useCallback(() => {
    (Object.entries(enabledMarkerCategories) as [TCategory, boolean][]).forEach(
      ([categoryId, isEnabled]) => {
        if (!isEnabled) toggleMarkerCategory(categoryId);
      }
    );
  }, [enabledMarkerCategories, toggleMarkerCategory]);

  const disableAll = useCallback(() => {
    (Object.entries(enabledMarkerCategories) as [TCategory, boolean][]).forEach(
      ([categoryId, isEnabled]) => {
        if (isEnabled) toggleMarkerCategory(categoryId);
      }
    );
  }, [enabledMarkerCategories, toggleMarkerCategory]);

  return (
    <div className={styles.overlay}>
      <button onClick={enableAll} className={styles.button}>
        Enable All
      </button>
      <button onClick={disableAll} className={styles.button}>
        Disable All
      </button>
    </div>
  );
}
