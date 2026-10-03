import { Suspense } from 'react';
import DatabaseClientPage from './database-client-page';
import Loading from './loading';
import databaseItems from '@/app/data/database.json';
import { DatabaseItem } from '@/types/database-item';
import { FilterOptions } from '@/types/filter';
import {
    getAvailability,
    itemFilterFields,
    listingFilterFields,
} from '@/lib/database-filter';

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
        for (const field of itemFilterFields) {
            for (const value of [item[field] ?? []].flat()) {
                addFilterOption(filterOptions, field, value);
            }
        }
        addFilterOption(filterOptions, 'availability', getAvailability(item));

        for (const listing of item.listings) {
            for (const field of listingFilterFields) {
                const value = listing[field];
                if (value === undefined) continue;
                addFilterOption(filterOptions, field, value);
            }
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
