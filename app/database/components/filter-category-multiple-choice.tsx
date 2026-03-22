import { CaretLeftIcon } from '@phosphor-icons/react';
import styles from '@/app/database/components/filter-category-multiple-choice.module.css';
import filterStyles from '@/app/database/components/filter-menu.module.css';
import { useDatabaseContext } from '@/app/context/database-context';
import { camelToTitle } from '@/lib/miscellaneous';

type Props = {
    category: string;
    onBack: () => void;
    title?: string;
    optionsOverride?: string[];
    optionLabelFormatter?: (option: string) => string;
};

export default function FilterCategoryMultipleChoice({
    category,
    onBack,
    title,
    optionsOverride,
    optionLabelFormatter,
}: Props) {
    const { filter, writeFilter, getClonedFilter } = useDatabaseContext();
    const categoryMap = filter.get(category);

    if (!categoryMap) return <div>Category not found.</div>;

    const options = optionsOverride ?? Array.from(categoryMap.keys());

    const toggleOption = (option: string) => {
        const nextFilter = getClonedFilter();
        const nextCategoryMap = nextFilter.get(category);
        if (!nextCategoryMap) return;
        const currentValue = nextCategoryMap.get(option) ?? false;
        nextCategoryMap.set(option, !currentValue);
        writeFilter(nextFilter);
    };

    const resetCategory = () => {
        const nextFilter = getClonedFilter();
        const nextCategoryMap = nextFilter.get(category);
        if (!nextCategoryMap) return;
        const targetOptions = new Set(options);
        nextCategoryMap.forEach((_, option) => {
            if (targetOptions.has(option)) {
                nextCategoryMap.set(option, false);
            }
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

            {options.map((option) => {
                const value = categoryMap.get(option);
                const checked = value === true;
                const label = optionLabelFormatter
                    ? optionLabelFormatter(option)
                    : option;

                return (
                    <label key={option} className={styles.container}>
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOption(option)}
                        />
                        <span className={styles.checkmark}></span>
                        {label}
                    </label>
                );
            })}

            {category === 'colours' && (
                <i className={filterStyles.resetButtonBottom}>
                    WIP: We are currently assigning colours to all items.
                </i>
            )}

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
