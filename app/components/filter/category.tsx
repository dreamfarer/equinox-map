import { useLayoutEffect, useRef, useState } from 'react';
import { CaretUpIcon } from '@phosphor-icons/react';
import styles from '@/app/components/filter/category.module.css';
import Entry from '@/app/components/filter/category/entry';

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
    const contentRef = useRef<HTMLDivElement>(null);
    const hasMounted = useRef(false);

    useLayoutEffect(() => {
        const el = contentRef.current;
        if (!el) return;

        const handleTransitionEnd = (e: TransitionEvent) => {
            if (e.propertyName !== 'max-height') return;
            if (!collapsed) {
                el.style.maxHeight = 'none';
            }
        };

        el.addEventListener('transitionend', handleTransitionEnd);

        if (!hasMounted.current) {
            el.style.maxHeight = collapsed ? '0px' : 'none';
            hasMounted.current = true;
            return () => {
                el.removeEventListener('transitionend', handleTransitionEnd);
            };
        }

        if (collapsed) {
            el.style.maxHeight = `${el.scrollHeight}px`;
            requestAnimationFrame(() => {
                el.style.maxHeight = '0px';
            });
        } else {
            el.style.maxHeight = '0px';
            requestAnimationFrame(() => {
                el.style.maxHeight = `${el.scrollHeight}px`;
            });
        }

        return () => {
            el.removeEventListener('transitionend', handleTransitionEnd);
        };
    }, [collapsed]);

    return (
        <div className={`category ${styles.category}`}>
            <div className={styles.header}>
                <button
                    onClick={onToggle}
                    className={`${styles.button} ${isActive ? styles.active : styles.inactive}`}
                >
                    {title}
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
                    />
                ))}
            </div>
        </div>
    );
}
