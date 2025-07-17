'use client';
import { useCallback } from 'react';
import { useMarkerContext } from '../context/marker-context';
import type { TCategory } from '@/types/category';
import styles from './overlay.module.css';
import { useMenuState } from '../context/menu-state-context';
import { useBookmarkContext } from '../context/bookmark-context';

export default function Overlay() {
  const { enabled, toggleCategory } = useMarkerContext();
  const { clearBookmarks } = useBookmarkContext();
  const { activeMenuName } = useMenuState();

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
