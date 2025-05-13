import styles from './category.module.css';

type Entry = {
  label: string;
  isActive: boolean;
  onToggle: () => void;
};

type CategoryProps = {
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
}: CategoryProps) {
  return (
    <div className={styles.category}>
      <button
        onClick={onToggle}
        className={`${styles.button} ${styles.title} ${isActive ? styles.active : styles.inactive}`}
      >
        {title}
      </button>
      <div className={styles.row}>
        {entries.map((entry, index) => (
          <div key={index} className={styles.column}>
            <button
              onClick={entry.onToggle}
              className={`${styles.button} ${styles.entry} ${entry.isActive ? styles.active : styles.inactive}`}
            >
              {entry.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
