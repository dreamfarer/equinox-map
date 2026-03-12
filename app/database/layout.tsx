import { Metadata } from 'next';
import { ReactNode } from 'react';
import { DatabaseItem } from '@/types/database-item';
import { FilterOptions } from '@/types/filter';
import { DatabaseFilterProvider } from '@/app/context/database-filter-context';
import databaseItems from '@/app/data/database.json';

export const metadata: Metadata = {
    title: 'Equinox: Homecoming Database',
    description:
        'Comprehensive database of character clothes, gear, and horse tack for Equinox: Homecoming. View stats, costs, level requirements, and item details.',
    alternates: {
        canonical: '/database',
    },
    openGraph: {
        title: 'Equinox: Homecoming Database',
        description:
            'Comprehensive database of character clothes, gear, and horse tack for Equinox: Homecoming. View stats, costs, level requirements, and item details.',
        url: '/database',
    },
    robots: { index: true, follow: true },
};

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

export default function DatabaseLayout({ children }: { children: ReactNode }) {
    return (
        <DatabaseFilterProvider
            filterOptions={buildFilterOptions(databaseItems)}
            allDatabaseItems={databaseItems}
        >
            {children}
        </DatabaseFilterProvider>
    );
}
