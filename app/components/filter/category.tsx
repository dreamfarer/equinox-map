import { useLayoutEffect, useRef, useState } from 'react';
import styles from './category.module.css';
import { CaretUp } from '@phosphor-icons/react';

type Entry = {
  label: string;
  isActive: boolean;
  onToggle: () => void;
};

type Props = {
  title: string;
  isActive: boolean;
  onToggle: () => void;
  entries: Entry[];
};

export default function Category({
  title,
  isActive,
  onToggle,
  entries,
}: Props) {
  const chunkedEntries: Entry[][] = [];
  const [collapsed, setCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  for (let i = 0; i < entries.length; i += 2) {
    chunkedEntries.push(entries.slice(i, i + 2));
  }

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const full = el.scrollHeight;
    if (collapsed) {
      el.style.maxHeight = `${full}px`;
      requestAnimationFrame(() => {
        el.style.maxHeight = '0px';
      });
    } else {
      el.style.maxHeight = '0px';
      requestAnimationFrame(() => {
        el.style.maxHeight = `${full}px`;
      });
    }
  }, [collapsed, entries.length]);

  return (
    <div className={styles.category}>
      <div className={styles.header}>
        <button
          onClick={onToggle}
          className={`${styles.button} ${styles.title} ${isActive ? styles.active : styles.inactive}`}
        >
          {title}
        </button>
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className={`${styles.caret} ${collapsed ? styles.collapsed : ''} ${
            isActive ? styles.active : styles.inactive
          }`}
          aria-label="Collapse Category"
        >
          <CaretUp size="1.4rem" />
        </button>
      </div>
      <div
        ref={contentRef}
        className={`${styles.entries} ${collapsed ? styles.collapsing : ''}`}
      >
        {chunkedEntries.map((group, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {group.map((entry, columnIndex) => (
              <div key={columnIndex} className={styles.column}>
                <button
                  onClick={entry.onToggle}
                  className={`${styles.button} ${styles.entry} ${entry.isActive ? styles.active : styles.inactive}`}
                  aria-label="Toggle Category"
                >
                  {entry.label}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
