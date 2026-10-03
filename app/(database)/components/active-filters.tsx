import { XIcon } from '@phosphor-icons/react';
import styles from '@/app/(database)/components/active-filters.module.css';
import { useDatabaseContext } from '@/app/(database)/context/database-context';
import { camelToTitle } from '@/lib/miscellaneous';
import { menuEntries, MenuEntry } from '@/schema/database/menu-entries';

type ActiveFilter = {
    category: string;
    option: string;
    title: string;
    label: string;
};

function flattenMenuEntries(entries: MenuEntry[]): MenuEntry[] {
    return entries.flatMap((entry) => [
        entry,
        ...flattenMenuEntries(entry.children ?? []),
    ]);
}

const menuEntryByCategory = new Map(
    flattenMenuEntries(menuEntries).map((entry) => [entry.field, entry])
);

export default function ActiveFilters() {
    const { filter, writeFilter, getClonedFilter } = useDatabaseContext();

    /* List the filters in the order of the menu, followed by the remaining */
    const categories = new Set([
        ...Array.from(menuEntryByCategory.keys()),
        ...Array.from(filter.keys()),
    ]);

    const activeFilters: ActiveFilter[] = [];
    categories.forEach((category) => {
        if (!category) return;
        const entry = menuEntryByCategory.get(category);
        const title = entry?.label ?? camelToTitle(category);
        filter.get(category)?.forEach((value, option) => {
            if (value === true) {
                const label = `${entry?.optionPrefix ?? ''}${option}`;
                activeFilters.push({ category, option, title, label });
            } else if (typeof value === 'string' && value !== '') {
                const label = `${option} ≤ ${value}`;
                activeFilters.push({ category, option, title, label });
            }
        });
    });

    const removeFilter = (category: string, option: string) => {
        const nextFilter = getClonedFilter();
        const nextCategoryMap = nextFilter.get(category);
        if (!nextCategoryMap) return;
        const currentValue = nextCategoryMap.get(option);
        nextCategoryMap.set(
            option,
            typeof currentValue === 'string' ? '' : false
        );
        writeFilter(nextFilter);
    };

    if (activeFilters.length === 0) return null;

    return (
        <div className={styles.activeFilters}>
            {activeFilters.map(({ category, option, title, label }) => (
                <button
                    key={`${category}:${option}`}
                    className={`outline ${styles.filter}`}
                    onClick={() => removeFilter(category, option)}
                    aria-label={`Remove filter ${title}: ${label}`}
                >
                    <span className={styles.title}>{title}:</span>
                    <span>{label}</span>
                    <XIcon size="1em" className={styles.icon} />
                </button>
            ))}
        </div>
    );
}
