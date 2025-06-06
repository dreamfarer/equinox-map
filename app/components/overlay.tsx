'use client';
import { useCallback } from 'react';
import { useMarkerLayerContext } from '../context/marker-layer';
import type { TCategory } from '@/types/category';
import styles from './overlay.module.css';
import { useSelectedLayoutSegment } from 'next/navigation';

export default function Overlay() {
  const { enabled, toggleCategory, clearBookmarks } = useMarkerLayerContext();
  const segment =
    (useSelectedLayoutSegment() as 'filter' | 'bookmarks' | null) ?? 'filter';

  const enableAll = useCallback(() => {
    (Object.entries(enabled) as [TCategory, boolean][]).forEach(
      ([categoryId, isEnabled]) => {
        if (!isEnabled) toggleCategory(categoryId);
      }
    );
  }, [enabled, toggleCategory]);

  const disableAll = useCallback(() => {
    (Object.entries(enabled) as [TCategory, boolean][]).forEach(
      ([categoryId, isEnabled]) => {
        if (isEnabled) toggleCategory(categoryId);
      }
    );
  }, [enabled, toggleCategory]);

  return (
    <div className={styles.overlay}>
      {segment === 'bookmarks' ? (
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
