import styles from '@/app/database/components/filter-menu.module.css';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import FilterCategoryMultipleChoice from '@/app/database/components/filter-category-multiple-choice';
import { useDatabaseContext } from '@/app/context/database-context';
import {
    buildFilterTree,
    getNodeByPath,
    collectLeafValues,
} from '@/lib/filter-tree';
import { menuEntries, MenuEntry } from '@/schema/database/menu-entries';

export default function FilterMenu() {
    const { resetFilters, filter } = useDatabaseContext();
    const [menuPath, setMenuPath] = useState<string[]>([]);

    const { activeEntry, remainingPath } = useMemo(() => {
        let current: MenuEntry | null = null;
        let pathIdx = 0;
        let levelItems = menuEntries;

        while (pathIdx < menuPath.length) {
            const segment = menuPath[pathIdx];
            const found = levelItems.find((e) => e.label === segment);
            if (!found) break;
            current = found;
            pathIdx++;
            if (found.children) {
                levelItems = found.children;
            } else {
                break;
            }
        }

        return {
            activeEntry: current,
            remainingPath: menuPath.slice(pathIdx),
        };
    }, [menuPath]);

    const handleBack = () => {
        setMenuPath((prev) => prev.slice(0, -1));
    };

    /* Root Menu */
    if (!activeEntry) {
        return (
            <div className={styles.filterMenu}>
                <h1>Filter</h1>
                <button
                    className={styles.resetButtonTop}
                    onClick={resetFilters}
                >
                    Reset all
                </button>
                {menuEntries.map((entry) => (
                    <button
                        key={entry.label}
                        className={styles.category}
                        onClick={() => setMenuPath([entry.label])}
                    >
                        <h2 className={styles.buttonLabel}>{entry.label}</h2>
                        <CaretRightIcon size="1.5em" />
                    </button>
                ))}
            </div>
        );
    }

    /* Static Submenu */
    if (activeEntry.children && remainingPath.length === 0) {
        return (
            <div className={styles.filterMenu}>
                <h1>{activeEntry.label}</h1>
                <button
                    className={styles.resetButtonTop}
                    onClick={resetFilters}
                >
                    Reset all
                </button>
                {activeEntry.children.map((child) => (
                    <button
                        key={child.label}
                        className={styles.category}
                        onClick={() => setMenuPath([...menuPath, child.label])}
                    >
                        <h2 className={styles.buttonLabel}>{child.label}</h2>
                        <CaretRightIcon size="1.5em" />
                    </button>
                ))}
                <button
                    className={styles.resetButtonBottom}
                    onClick={handleBack}
                >
                    <CaretLeftIcon size="1em" />
                    Return
                </button>
            </div>
        );
    }

    /* Selection List (Flat or Hierarchical) */
    if (activeEntry.field) {
        if (activeEntry.isHierarchical) {
            const tree = buildFilterTree(
                activeEntry.label,
                Array.from(filter.get(activeEntry.field)?.keys() ?? [])
            );
            const currentNode = getNodeByPath(tree, remainingPath);

            if (!currentNode) return <div>Category not found.</div>;

            const hasOnlyLeafChildren = Array.from(
                currentNode.children.values()
            ).every((child) => child.children.size === 0);

            if (hasOnlyLeafChildren && currentNode.children.size > 0) {
                return (
                    <FilterCategoryMultipleChoice
                        category={activeEntry.field}
                        title={currentNode.label}
                        optionsOverride={collectLeafValues(currentNode)}
                        optionLabelFormatter={(option) =>
                            option.split('/').at(-1) ?? option
                        }
                        onBack={handleBack}
                    />
                );
            }

            return (
                <div className={styles.filterMenu}>
                    <h1>{currentNode.label}</h1>
                    <button
                        className={styles.resetButtonTop}
                        onClick={resetFilters}
                    >
                        Reset all
                    </button>
                    {Array.from(currentNode.children.values()).map((child) => (
                        <button
                            key={child.fullPath}
                            className={styles.category}
                            onClick={() =>
                                setMenuPath([...menuPath, child.label])
                            }
                        >
                            <h2 className={styles.buttonLabel}>
                                {child.label}
                            </h2>
                            <CaretRightIcon size="1.5em" />
                        </button>
                    ))}
                    <button
                        className={styles.resetButtonBottom}
                        onClick={handleBack}
                    >
                        <CaretLeftIcon size="1em" />
                        Return
                    </button>
                </div>
            );
        }

        return (
            <FilterCategoryMultipleChoice
                category={activeEntry.field}
                title={activeEntry.label}
                onBack={handleBack}
            />
        );
    }

    return <div>Category not found.</div>;
}
