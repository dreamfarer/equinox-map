import styles from '@/app/database/components/filter-menu.module.css';
import { CaretRightIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import FilterCategoryMultipleChoice from '@/app/database/components/filter-category-multiple-choice';
import { useDatabaseContext } from '@/app/context/database-context';
import { camelToTitle } from '@/lib/miscellaneous';
import TypeSelectionMenu from '@/app/database/components/type-selection-menu';
import {
    buildTypeFilterTree,
    collectLeafPaths,
    getTypeNodeByPath,
} from '@/lib/type-filter';
import { rootMenuEntries } from '@/schema/database/menu-entries';

export default function FilterMenu() {
    const { resetFilters, filter } = useDatabaseContext();
    const [menuPath, setMenuPath] = useState<string[]>([]);
    const selectedRootMenuEntry = menuPath[0] ?? null;

    const typeTree = useMemo(() => {
        return buildTypeFilterTree(
            Array.from(filter.get('type')?.keys() ?? [])
        );
    }, [filter]);

    if (!selectedRootMenuEntry) {
        return (
            <div className={styles.filterMenu}>
                <h1>Filter</h1>
                <button
                    className={styles.resetButtonTop}
                    onClick={resetFilters}
                >
                    Reset all
                </button>

                {rootMenuEntries.map((entry) => (
                    <button
                        key={entry}
                        className={styles.category}
                        onClick={() => setMenuPath([entry])}
                    >
                        <h2 className={styles.buttonLabel}>
                            {camelToTitle(entry)}
                        </h2>
                        <CaretRightIcon size="1.5em" />
                    </button>
                ))}
            </div>
        );
    }

    if (selectedRootMenuEntry !== 'type') {
        return (
            <FilterCategoryMultipleChoice
                category={selectedRootMenuEntry}
                onBack={() => setMenuPath([])}
            />
        );
    }

    const currentNode = getTypeNodeByPath(typeTree, menuPath.slice(1));
    if (!currentNode) {
        return <div>Type category not found.</div>;
    }

    const hasOnlyLeafChildren = Array.from(currentNode.children.values()).every(
        (child) => child.children.size === 0
    );
    if (hasOnlyLeafChildren && currentNode.children.size > 0) {
        return (
            <FilterCategoryMultipleChoice
                category="type"
                title={
                    currentNode.label === 'type' ? 'Type' : currentNode.label
                }
                optionsOverride={collectLeafPaths(currentNode)}
                optionLabelFormatter={(option) =>
                    option.split('/').at(-1) ?? option
                }
                onBack={() => {
                    if (menuPath.length <= 1) {
                        setMenuPath([]);
                        return;
                    }
                    setMenuPath(menuPath.slice(0, -1));
                }}
            />
        );
    }

    return (
        <TypeSelectionMenu
            title={currentNode.label === 'type' ? 'Type' : currentNode.label}
            node={currentNode}
            onSelect={(segment) => setMenuPath([...menuPath, segment])}
            onBack={() => {
                if (menuPath.length <= 1) {
                    setMenuPath([]);
                    return;
                }
                setMenuPath(menuPath.slice(0, -1));
            }}
            onResetAll={resetFilters}
        />
    );
}
