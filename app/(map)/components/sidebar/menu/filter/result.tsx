import styles from '@/app/(map)/components/sidebar/menu/filter/result.module.css';

type Props = {
    title: string;
    category: string;
    count?: number;
    onSelect: () => void;
};

export default function Result({ title, category, count, onSelect }: Props) {
    return (
        <button className={styles.result} onClick={onSelect}>
            <h2>
                {title} {count && count > 1 && <span>({count})</span>}
            </h2>
            <h3>{category}</h3>
        </button>
    );
}
