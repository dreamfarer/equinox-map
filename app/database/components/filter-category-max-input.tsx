import { CaretLeftIcon } from '@phosphor-icons/react';
import styles from '@/app/database/components/filter-category-max-input.module.css';
import filterStyles from '@/app/database/components/filter-menu.module.css';
import { useDatabaseContext } from '@/app/context/database-context';
import { camelToTitle } from '@/lib/miscellaneous';

type Props = {
    category: string;
    onBack: () => void;
    title?: string;
};

export default function FilterCategoryMaxInput({
    category,
    onBack,
    title,
}: Props) {
    const { filter, writeFilter, getClonedFilter } = useDatabaseContext();
    const categoryMap = filter.get(category);

    if (!categoryMap) return <div>Category not found.</div>;

    const options = Array.from(categoryMap.keys());

    const setOptionValue = (option: string, value: string) => {
        const nextFilter = getClonedFilter();
        const nextCategoryMap = nextFilter.get(category);
        if (!nextCategoryMap) return;
        nextCategoryMap.set(option, value);
        writeFilter(nextFilter);
    };

    const resetCategory = () => {
        const nextFilter = getClonedFilter();
        const nextCategoryMap = nextFilter.get(category);
        if (!nextCategoryMap) return;
        nextCategoryMap.forEach((_, option) => {
            nextCategoryMap.set(option, '');
        });
        writeFilter(nextFilter);
    };

    return (
        <div className={filterStyles.filterMenu}>
            <h1>{title ?? camelToTitle(category)}</h1>

            <button
                className={filterStyles.resetButtonTop}
                onClick={resetCategory}
            >
                Reset all
            </button>

            <div className={styles.container}>
                {options.map((option) => {
                    const value = categoryMap.get(option);
                    const displayValue = typeof value === 'string' ? value : '';
                    return (
                        <div key={option} className={styles.entry}>
                            <label className={styles.label}>{option}</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={displayValue}
                                onChange={(e) =>
                                    setOptionValue(option, e.target.value)
                                }
                                placeholder="Max"
                                min="0"
                            />
                        </div>
                    );
                })}
            </div>

            <div>
                <button
                    className={filterStyles.resetButtonBottom}
                    onClick={onBack}
                >
                    <CaretLeftIcon size="1em" />
                    Return
                </button>
            </div>
        </div>
    );
}
