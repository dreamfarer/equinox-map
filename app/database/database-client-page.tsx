'use client';

import styles from '@/app/database/page.module.css';
import Searchbar from '@/app/components/searchbar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FunnelIcon, MapTrifoldIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { DatabaseItem } from '@/types/database-item';
import DatabaseTile from '@/app/database/components/database-tile';
import FilterMenu from '@/app/database/components/filter-menu';
import { FilterOptions } from '@/types/filter';

const filterOptions: FilterOptions = new Map([
    ['Type', ['Clothing', 'Weapons', 'Tack', 'Accessories', 'Consumables']],
    ['Source', ['Shop', 'Quest Reward', 'Event', 'Crafting', 'Limited']],
]);

type Props = {
    databaseItems: DatabaseItem[];
};

export default function DatabaseClientPage({ databaseItems }: Props) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const query = searchParams.get('query') ?? '';

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return databaseItems.filter((item) =>
            item.name.toLowerCase().includes(q)
        );
    }, [databaseItems, query]);

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
                {isFilterOpen && <FilterMenu filterOptions={filterOptions} />}
            </div>

            <div className={styles.grid}>
                {filtered.map((item) => (
                    <DatabaseTile key={item.id} {...item} />
                ))}
            </div>
        </div>
    );
}
