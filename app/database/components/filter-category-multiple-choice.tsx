import { CaretLeftIcon } from '@phosphor-icons/react';
import styles from '@/app/database/components/filter-menu.module.css';
import { useDatabaseFilterContext } from '@/app/context/database-filter-context';

type Props = {
    category: string;
    onBack: () => void;
};

export default function FilterCategoryMultipleChoice({
    category,
    onBack,
}: Props) {
    const { filter, setFilter } = useDatabaseFilterContext();

    const options = filter.get(category);

    if (!options) {
        return <div>Category not found.</div>;
    }

    const toggleOption = (option: string) => {
        setFilter((prev) => {
            const newFilter = new Map(prev);
            const categoryMap = new Map(newFilter.get(category));

            const currentValue = categoryMap.get(option) ?? false;
            categoryMap.set(option, !currentValue);

            newFilter.set(category, categoryMap);
            return newFilter;
        });
    };

    const resetCategory = () => {
        setFilter((prev) => {
            const newFilter = new Map(prev);
            const categoryMap = new Map(newFilter.get(category));

            categoryMap.forEach((_, option) => {
                categoryMap.set(option, false);
            });

            newFilter.set(category, categoryMap);
            return newFilter;
        });
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

                <button onClick={onBack}>Apply</button>
            </div>
        </div>
    );
}
