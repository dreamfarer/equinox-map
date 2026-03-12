import styles from '@/app/database/components/filter-menu.module.css';
import { CaretRightIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import FilterCategoryMultipleChoice from '@/app/database/components/filter-category-multiple-choice';
import { useDatabaseFilterContext } from '@/app/context/database-filter-context';
import { usePathname, useSearchParams } from 'next/navigation';
import { updateAddressBar } from '@/lib/database';

export default function FilterMenu() {
    const { filter } = useDatabaseFilterContext();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );

    const pathname = usePathname();
    const searchParams = useSearchParams();

    function resetFilters() {
        const params = new URLSearchParams(searchParams.toString());
        for (const category of filter.keys()) {
            params.delete(category);
        }
        updateAddressBar(params, pathname);
    }

    if (selectedCategory) {
        return (
            <FilterCategoryMultipleChoice
                category={selectedCategory}
                onBack={() => setSelectedCategory(null)}
            />
        );
    }

    return (
        <div className={styles.filterMenu}>
            <h1>Filter</h1>

            <button className={styles.resetButton} onClick={resetFilters}>
                Reset all
            </button>

            {Array.from(filter.keys()).map((category) => (
                <button
                    key={category}
                    className={styles.category}
                    onClick={() => setSelectedCategory(category)}
                >
                    <h2 className={styles.buttonLabel}>{category}</h2>
                    <CaretRightIcon size="1.5em" />
                </button>
            ))}

            <button type="button">Close</button>
        </div>
    );
}
