import styles from '@/app/components/filter/result.module.css';

type Props = {
    title: string;
    category: string;
    count?: number;
    onSelect: () => void;
};

export default function Result({ title, category, count, onSelect }: Props) {
    return (
        <div className={styles.result} onClick={onSelect}>
            <div className={styles.information}>
                <div className={styles.title}>
                    {title} {count && count > 1 && <span>({count})</span>}
                </div>
                <div className={styles.subtitle}>{category}</div>
            </div>
        </div>
    );
}
