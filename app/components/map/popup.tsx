import { X } from '@phosphor-icons/react';
import styles from './popup.module.css';

export function Popup({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <div className={styles.popup}>
      <div className={styles.frame}>
        <div className={styles.title}>{title}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        <button
          className={styles.quit}
          onClick={onClose}
          aria-label="Close popup"
        >
          <X size="1.5em" />
        </button>
      </div>
    </div>
  );
}
