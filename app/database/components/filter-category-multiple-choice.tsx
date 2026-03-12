import { CaretLeftIcon } from '@phosphor-icons/react';
import styles from '@/app/database/components/filter-menu.module.css';
import { useDatabaseContext } from '@/app/context/database-context';

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
        <div className={styles.filterMenu}>
            <h1>{category}</h1>

            <button className={styles.resetButton} onClick={resetCategory}>
                Reset all
            </button>

            {Array.from(options.entries()).map(([option, checked]) => (
                <label key={option}>
                    {option}
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOption(option)}
                    />
                </label>
            ))}

            <div>
                <button onClick={onBack}>
                    <CaretLeftIcon size="1.5em" />
                    <h2>Return</h2>
                </button>
            </div>
        </div>
    );
}
