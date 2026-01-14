import styles from './entry.module.css';
import { BookmarkSimpleIcon } from '@phosphor-icons/react';

type Props = {
    label: string;
    isActive: boolean;
    columnIndex: number;
    onToggle: () => void;
    onToggleBookmark: () => void;
    bookmarkState: 'none' | 'partial' | 'full';
};

export default function Entry({
    label,
    isActive,
    columnIndex,
    onToggle,
    onToggleBookmark,
    bookmarkState,
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
            <button
                onClick={onToggleBookmark}
                className={`${styles.button} ${isActive ? styles.active : styles.inactive}`}
                aria-label={`${
                    bookmarkState === 'full' ? 'Remove bookmark' : 'Bookmark'
                } ${label}`}
                data-bookmark-state={bookmarkState}
            >
                <BookmarkSimpleIcon
                    size="1em"
                    weight={
                        bookmarkState === 'full'
                            ? 'fill'
                            : bookmarkState === 'partial'
                              ? 'duotone'
                              : 'regular'
                    }
                />
            </button>
        </div>
    );
}
