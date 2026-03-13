'use client';

import { useMemo, useState } from 'react';
import styles from '@/app/database/page.module.css';
import Searchbar from '@/app/components/searchbar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FunnelIcon, MapTrifoldIcon } from '@phosphor-icons/react';
import DatabaseTile from '@/app/database/components/database-tile';
import FilterMenu from '@/app/database/components/filter-menu';
import { useDatabaseContext } from '@/app/context/database-context';
import { DatabaseProvider } from '@/app/context/database-context';
import { DatabaseItem } from '@/types/database-item';
import { Filter, FilterOptions } from '@/types/filter';

type Props = {
    allDatabaseItems: DatabaseItem[];
    filterOptions: FilterOptions;
};

function Content() {
    const { filteredDatabaseItems, writeSearchQuery } = useDatabaseContext();
    const router = useRouter();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <button
                    id="navigateToMapButton"
                    onClick={() => router.push('/')}
                    className={styles.buttonLeft}
                    aria-label="Navigate back to the interactive map"
                >
                    <MapTrifoldIcon size="2em" />
                </button>
                <Searchbar onSearchAction={writeSearchQuery} />
                <button
                    id="filter"
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    className={styles.buttonRight}
                    aria-label="Filter the clothing and tack database"
                >
                    <FunnelIcon size="2em" />
                </button>
                {isFilterOpen && <FilterMenu />}
            </div>
            <div className={styles.grid}>
                {filteredDatabaseItems.map((item) => (
                    <DatabaseTile key={item.id} {...item} />
                ))}
            </div>
        </div>
    );
}

export default function DatabaseClientPage({
    allDatabaseItems,
    filterOptions,
}: Props) {
    const urlParameters = useSearchParams();
    const pathname = usePathname();

    const filter = useMemo(() => {
        const filter: Filter = new Map();
        const params = new URLSearchParams(urlParameters.toString());
        filterOptions.forEach((options, category) => {
            const selected = new Set(params.getAll(category));
            const optionMap = new Map<string, boolean>();
            options.forEach((option) => {
                optionMap.set(option, selected.has(option));
            });
            filter.set(category, optionMap);
        });
        return filter;
    }, [urlParameters, filterOptions]);

    return (
        <DatabaseProvider
            allDatabaseItems={allDatabaseItems}
            filter={filter}
            urlParameters={urlParameters}
            pathname={pathname}
        >
            <Content />
        </DatabaseProvider>
    );
}
