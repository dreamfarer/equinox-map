'use client';

import { useMemo, useState } from 'react';
import styles from '@/app/database/page.module.css';
import Searchbar from '@/app/components/searchbar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FunnelIcon, MapTrifoldIcon } from '@phosphor-icons/react';
import DatabaseTile from '@/app/database/components/database-tile';
import FilterMenu from '@/app/database/components/filter-menu';
import { useDatabaseFilterContext } from '@/app/context/database-filter-context';
import { DatabaseFilterProvider } from '@/app/context/database-filter-context';
import { buildFilterFromSearchParams, updateAddressBar } from '@/lib/database';
import { DatabaseItem } from '@/types/database-item';
import { FilterOptions } from '@/types/filter';
import { Dispatch, SetStateAction } from 'react';

type Props = {
    allDatabaseItems: DatabaseItem[];
    filterOptions: FilterOptions;
};

function DatabasePageContent({
    query,
    setQuery,
    isFilterOpen,
    setIsFilterOpen,
}: {
    query: string;
    setQuery: (nextQuery: string) => void;
    isFilterOpen: boolean;
    setIsFilterOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const { filteredDatabaseItems } = useDatabaseFilterContext();
    const router = useRouter();

    const searchedAndFilteredDatabaseItems = useMemo(() => {
        if (!query.trim()) return filteredDatabaseItems;
        return filteredDatabaseItems.filter((item) =>
            item.name.toLowerCase().includes(query.trim().toLowerCase())
        );
    }, [filteredDatabaseItems, query]);

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
                <Searchbar onSearchAction={setQuery} />
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
                {searchedAndFilteredDatabaseItems.map((item) => (
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
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const query = searchParams.get('query') ?? '';

    const filter = useMemo(() => {
        return buildFilterFromSearchParams(
            new URLSearchParams(searchParams.toString()),
            filterOptions
        );
    }, [searchParams, filterOptions]);

    function setQuery(nextQuery: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (nextQuery.trim()) {
            params.set('query', nextQuery);
        } else {
            params.delete('query');
        }
        updateAddressBar(params, pathname);
    }

    return (
        <DatabaseFilterProvider
            allDatabaseItems={allDatabaseItems}
            filter={filter}
        >
            <DatabasePageContent
                query={query}
                setQuery={setQuery}
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
            />
        </DatabaseFilterProvider>
    );
}
