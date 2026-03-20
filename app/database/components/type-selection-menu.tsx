import styles from '@/app/database/components/filter-menu.module.css';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { TypeFilterNode } from '@/lib/type-filter';

type Props = {
    title: string;
    node: TypeFilterNode;
    onSelect: (segment: string) => void;
    onBack: () => void;
    onResetAll: () => void;
};

export default function TypeSelectionMenu({
    title,
    node,
    onSelect,
    onBack,
    onResetAll,
}: Props) {
    const entries = Array.from(node.children.values());

    return (
        <div className={styles.filterMenu}>
            <h1>{title}</h1>

            <button className={styles.resetButtonTop} onClick={onResetAll}>
                Reset all
            </button>

            {entries.map((entry) => (
                <button
                    key={entry.fullPath}
                    className={styles.category}
                    onClick={() => onSelect(entry.label)}
                >
                    <h2 className={styles.buttonLabel}>{entry.label}</h2>
                    <CaretRightIcon size="1.5em" />
                </button>
            ))}

            <div>
                <button className={styles.resetButtonBottom} onClick={onBack}>
                    <CaretLeftIcon size="1em" />
                    Return
                </button>
            </div>
        </div>
    );
}
