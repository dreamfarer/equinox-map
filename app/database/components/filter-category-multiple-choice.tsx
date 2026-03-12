import { CaretLeftIcon } from '@phosphor-icons/react';
import styles from '@/app/database/components/filter-category-multiple-choice.module.css';
import filterStyles from '@/app/database/components/filter-menu.module.css';
import { useDatabaseContext } from '@/app/context/database-context';
import { camelToTitle } from '@/lib/miscellaneous';

type Props = {
    category: string;
    onBack: () => void;
};

export default function FilterCategoryMultipleChoice({
    category,
    onBack,
}: Props) {
    const { filter, writeFilter, getClonedFilter } = useDatabaseContext();
    const options = filter.get(category);

    if (!options) {
        return <div>Category not found.</div>;
    }

    const toggleOption = (option: string) => {
        const nextFilter = getClonedFilter();
        const categoryMap = nextFilter.get(category);
        if (!categoryMap) return;
        const currentValue = categoryMap.get(option) ?? false;
        categoryMap.set(option, !currentValue);
        writeFilter(nextFilter);
    };

    const resetCategory = () => {
        const nextFilter = getClonedFilter();
        const categoryMap = nextFilter.get(category);
        if (!categoryMap) return;
        categoryMap.forEach((_, option) => {
            categoryMap.set(option, false);
        });
        writeFilter(nextFilter);
    };

    return (
        <div className={filterStyles.filterMenu}>
            <h1>{camelToTitle(category)}</h1>

            <button
                className={filterStyles.resetButtonTop}
                onClick={resetCategory}
            >
                Reset all
            </button>

            {Array.from(options.entries()).map(([option, checked]) => (
                <label key={option} className={styles.container}>
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOption(option)}
                    />
                    <span className={styles.checkmark}></span>
                    {option}
                </label>
            ))}

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
