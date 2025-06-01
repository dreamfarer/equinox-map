'use client';

import { useCallback } from 'react';
import { useMarkerLayerContext } from '../context/marker-layer';
import type { TCategory } from '@/types/category';
import type { TMenu } from '@/types/menu';
import styles from './overlay.module.css';

interface Props {
  selectedMenu: TMenu;
}

const Overlay: React.FC<Props> = ({ selectedMenu }) => {
  const { enabled, toggleCategory, clearBookmarks } = useMarkerLayerContext();

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
      {selectedMenu === 'bookmarks' ? (
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
};

export default Overlay;
