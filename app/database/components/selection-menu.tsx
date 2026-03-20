import styles from '@/app/database/components/filter-menu.module.css';
import { CaretRightIcon } from '@phosphor-icons/react';
import { Dispatch, SetStateAction } from 'react';
import { useDatabaseContext } from '@/app/context/database-context';
import { camelToTitle } from '@/lib/miscellaneous';

type Props = {
    menuEntries: string[];
    setSelectedCategory: Dispatch<SetStateAction<string | null>>;
};

export default function SelectionMenu({
    menuEntries,
    setSelectedCategory,
}: Props) {
    const { resetFilters } = useDatabaseContext();

    return (
        <div className={styles.filterMenu}>
            <h1>Filter</h1>
            <button className={styles.resetButtonTop} onClick={resetFilters}>
                Reset all
            </button>

            {menuEntries.map((entry) => (
                <button
                    key={entry}
                    className={styles.category}
                    onClick={() => setSelectedCategory(entry)}
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
