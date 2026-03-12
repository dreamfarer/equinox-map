import { Suspense } from 'react';
import DatabaseClientPage from './database-client-page';
import Loading from './loading';
import databaseItems from '@/app/data/database.json';
import { DatabaseItem } from '@/types/database-item';
import { FilterOptions } from '@/types/filter';

function buildFilterOptions(allDatabaseItems: DatabaseItem[]): FilterOptions {
    const filterOptions: FilterOptions = new Map();
    for (const item of allDatabaseItems) {
        for (const [key, value] of Object.entries(item)) {
            if (value === undefined || value === null) continue;
            if (key === 'id' || key === 'name' || key === 'imagePath') continue;
            const stringValue = String(value);
            if (!filterOptions.has(key)) {
                filterOptions.set(key, []);
            }
            const options = filterOptions.get(key)!;
            if (!options.includes(stringValue)) {
                options.push(stringValue);
            }
        }
    }
    return filterOptions;
}

export default function DatabasePage() {
    return (
        <Suspense fallback={<Loading />}>
            <DatabaseClientPage
                allDatabaseItems={databaseItems}
                filterOptions={buildFilterOptions(databaseItems)}
            />
        </Suspense>
    );
}
