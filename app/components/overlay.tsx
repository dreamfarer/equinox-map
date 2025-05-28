'use client';

import { useMarkerLayerContext } from '../context/marker-layer';
import type { TCategory } from '@/types/category';
import styles from './overlay.module.css';

export default function Overlay() {
  const { enabled, toggleCategory } = useMarkerLayerContext();

  const enableAll = () => {
    (Object.entries(enabled) as [TCategory, boolean][]).forEach(
      ([categoryId, isEnabled]) => {
        if (!isEnabled) toggleCategory(categoryId);
      }
    );
  };

  const disableAll = () => {
    (Object.entries(enabled) as [TCategory, boolean][]).forEach(
      ([categoryId, isEnabled]) => {
        if (isEnabled) toggleCategory(categoryId);
      }
    );
  };

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
