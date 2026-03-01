import styles from '@/app/components/filter/category/entry.module.css';

type Props = {
    label: string;
    isActive: boolean;
    columnIndex: number;
    onToggle: () => void;
};

export default function Entry({
    label,
    isActive,
    columnIndex,
    onToggle,
}: Props) {
    return (
        <div key={columnIndex} className={styles.entry}>
            <button
                onClick={onToggle}
                className={`${styles.button} ${isActive ? styles.active : styles.inactive}`}
                aria-label="Toggle Category"
            >
                {label}
            </button>
        </div>
    );
}
