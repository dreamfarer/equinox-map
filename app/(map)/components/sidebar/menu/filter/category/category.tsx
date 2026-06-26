import { useState } from 'react';
import { CaretUpIcon } from '@phosphor-icons/react';
import styles from '@/app/(map)/components/sidebar/menu/filter/category/category.module.css';
import Entry from '@/app/(map)/components/sidebar/menu/filter/category/entry';

type EntryType = {
    label: string;
    isActive: boolean;
    onToggle: () => void;
};

type Props = {
    title: string;
    isActive: boolean;
    onToggle: () => void;
    entries: EntryType[];
};

export default function Category({
    title,
    isActive,
    onToggle,
    entries,
}: Props) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div>
            <div className={styles.header}>
                <button
                    style={{ background: 'none' }}
                    onClick={onToggle}
                    className={`${!isActive && 'inactive'}`}
                    aria-label="Toggle Category"
                >
                    <h1>{title}</h1>
                </button>
                <button
                    style={{ background: 'none' }}
                    onClick={() => setCollapsed((prev) => !prev)}
                    className={`${styles.caret} ${collapsed ? styles.collapsed : ''} ${!isActive && 'inactive'}`}
                    aria-label="Collapse Category"
                >
                    <CaretUpIcon size="1rem" />
                </button>
            </div>
            <div
                className={`${styles.wrapper} ${collapsed ? styles.collapsed : ''}`}
            >
                <div className={styles.entries}>
                    {entries.map((entry, i) => (
                        <Entry
                            key={i}
                            label={entry.label}
                            isActive={entry.isActive}
                            columnIndex={i % 2}
                            onToggle={entry.onToggle}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
