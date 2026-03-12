'use client';

import styles from '@/app/database/page.module.css';
import Searchbar from '@/app/components/searchbar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FunnelIcon, MapTrifoldIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import DatabaseTile from '@/app/database/components/database-tile';
import FilterMenu from '@/app/database/components/filter-menu';
import { useDatabaseFilterContext } from '@/app/context/database-filter-context';

export default function DatabaseClientPage() {
    const { filteredDatabaseItems } = useDatabaseFilterContext();

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const query = searchParams.get('query') ?? '';

    function setQuery(nextQuery: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (nextQuery) {
            params.set('query', nextQuery);
        } else {
            params.delete('query');
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

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
                <Searchbar onSearchAction={(value) => setQuery(value)} />
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
