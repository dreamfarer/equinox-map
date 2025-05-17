import styles from './category.module.css';

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
  for (let i = 0; i < entries.length; i += 2) {
    chunkedEntries.push(entries.slice(i, i + 2));
  }

  return (
    <div className={styles.category}>
      <button
        onClick={onToggle}
        className={`${styles.button} ${styles.title} ${isActive ? styles.active : styles.inactive}`}
      >
        {title}
      </button>
      {chunkedEntries.map((group, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {group.map((entry, columnIndex) => (
            <div key={columnIndex} className={styles.column}>
              <button
                onClick={entry.onToggle}
                className={`${styles.button} ${styles.entry} ${entry.isActive ? styles.active : styles.inactive}`}
              >
                {entry.label}
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
