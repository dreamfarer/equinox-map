import { Suspense } from 'react';
import DatabaseClientPage from './database-client-page';
import Loading from './loading';
import databaseItems from '@/app/data/database.json';
import { DatabaseItem } from '@/types/database-item';
import { FilterOptions } from '@/types/filter';

function addFilterOption(
    filterOptions: FilterOptions,
    category: string,
    option: string
) {
    if (!filterOptions.has(category)) {
        filterOptions.set(category, []);
    }

    const options = filterOptions.get(category)!;
    if (!options.includes(option)) {
        options.push(option);
    }
}

function buildFilterOptions(allDatabaseItems: DatabaseItem[]): FilterOptions {
    const filterOptions: FilterOptions = new Map();

    for (const item of allDatabaseItems) {
        for (const [key, value] of Object.entries(item)) {
            if (value === undefined || value === null) continue;
            if (key === 'id' || key === 'name' || key === 'imagePath') continue;
            if (Array.isArray(value)) {
                for (const entry of value) {
                    addFilterOption(filterOptions, key, String(entry));
                }
                continue;
            }
            addFilterOption(filterOptions, key, String(value));
        }
    }

    for (const [key, options] of filterOptions) {
        options.sort((a, b) => a.localeCompare(b));
        filterOptions.set(key, options);
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
