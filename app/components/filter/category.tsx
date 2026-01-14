import { useLayoutEffect, useRef, useState } from 'react';
import styles from './category.module.css';
import { BookmarkSimpleIcon, CaretUpIcon } from '@phosphor-icons/react';
import Entry from './category/entry';

type EntryType = {
    label: string;
    isActive: boolean;
    onToggle: () => void;
    onToggleBookmark: () => void;
    bookmarkState: 'none' | 'partial' | 'full';
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
    const contentRef = useRef<HTMLDivElement>(null);
    const hasMounted = useRef(false);

    useLayoutEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        const full = el.scrollHeight;

        if (!hasMounted.current) {
            el.style.maxHeight = collapsed ? '0px' : `${full}px`;
            hasMounted.current = true;
            return;
        }

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
                    className={`${styles.button} ${isActive ? styles.active : styles.inactive}`}
                >
                    {title}
                </button>
                <button
                    onClick={() => {
                        const anyBookmarked = entries.some(
                            (e) => e.bookmarkState !== 'none'
                        );
                        entries.forEach((entry) => {
                            const shouldChange = anyBookmarked
                                ? entry.bookmarkState !== 'none'
                                : entry.bookmarkState === 'none';

                            if (shouldChange) {
                                entry.onToggleBookmark();
                            }
                        });
                    }}
                    className={`${styles.button} ${isActive ? styles.active : styles.inactive}`}
                    data-bookmark-state={
                        entries.every((e) => e.bookmarkState === 'full')
                            ? 'full'
                            : entries.some((e) => e.bookmarkState !== 'none')
                              ? 'partial'
                              : 'none'
                    }
                    aria-label="Toggle all bookmarks in category"
                >
                    <BookmarkSimpleIcon
                        size="1em"
                        weight={
                            entries.every((e) => e.bookmarkState === 'full')
                                ? 'fill'
                                : entries.some(
                                        (e) => e.bookmarkState !== 'none'
                                    )
                                  ? 'duotone'
                                  : 'regular'
                        }
                    />
                </button>
                <button
                    onClick={() => setCollapsed((prev) => !prev)}
                    className={`${styles.caret} ${collapsed ? styles.collapsed : ''} ${isActive ? styles.active : styles.inactive}`}
                    aria-label="Collapse Category"
                >
                    <CaretUpIcon size="1em" />
                </button>
            </div>
            <div
                ref={contentRef}
                className={`${styles.entries} ${collapsed ? styles.collapsing : ''}`}
            >
                {entries.map((entry, i) => (
                    <Entry
                        key={i}
                        label={entry.label}
                        isActive={entry.isActive}
                        columnIndex={i % 2}
                        onToggle={entry.onToggle}
                        onToggleBookmark={entry.onToggleBookmark}
                        bookmarkState={entry.bookmarkState}
                    />
                ))}
            </div>
        </div>
    );
}
