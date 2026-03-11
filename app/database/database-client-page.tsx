'use client';

import styles from '@/app/database/page.module.css';
import Searchbar from '@/app/components/searchbar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FunnelIcon, MapTrifoldIcon } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { DatabaseItem } from '@/types/database-item';
import DatabaseTile from '@/app/database/components/database-tile';

export default function DatabaseClientPage() {
    const [items, setItems] = useState<DatabaseItem[]>([]);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const query = searchParams.get('query') ?? '';

    useEffect(() => {
        fetch('/export/database.json')
            .then((r) => r.json())
            .then(setItems)
            .catch(console.error);
    }, []);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return items.filter((item) => item.name.toLowerCase().includes(q));
    }, [items, query]);

    function setQuery(nextQuery: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (nextQuery) {
            params.set('query', nextQuery);
        } else {
            params.delete('query');
        }
        router.replace(`${pathname}?${params.toString()}`);
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
                    onClick={() => {}}
                    className={styles.buttonRight}
                    aria-label="Filter the clothing and tack database"
                >
                    <FunnelIcon size="2em" />
                </button>
            </div>
            <div className={styles.grid}>
                {filtered.map((item, index) => (
                    <DatabaseTile key={index} {...item} />
                ))}
            </div>
        </div>
    );
}
