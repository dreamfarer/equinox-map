'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { DatabaseItem } from '@/types/database-item';
import { Filter } from '@/types/filter';

type DatabaseFilterValue = {
    filteredDatabaseItems: DatabaseItem[];
    allDatabaseItems: DatabaseItem[];
    filter: Filter;
};

type DatabaseFilterProviderProps = {
    children: ReactNode;
    allDatabaseItems: DatabaseItem[];
    filter: Filter;
};

const DatabaseFilterContext = createContext<DatabaseFilterValue | null>(null);

export function DatabaseFilterProvider({
    children,
    allDatabaseItems,
    filter,
}: Readonly<DatabaseFilterProviderProps>) {
    const filteredDatabaseItems = useMemo(() => {
        return allDatabaseItems.filter((item) => {
            for (const [category, optionMap] of filter.entries()) {
                const selectedOptions = Array.from(optionMap.entries())
                    .filter(([, isSelected]) => isSelected)
                    .map(([option]) => option);
                if (selectedOptions.length === 0) continue;
                const itemValue = item[category as keyof DatabaseItem];
                if (itemValue === undefined || itemValue === null) return false;
                if (!selectedOptions.includes(String(itemValue))) return false;
            }
            return true;
        });
    }, [allDatabaseItems, filter]);

    const contextValue = useMemo<DatabaseFilterValue>(
        () => ({
            filteredDatabaseItems,
            allDatabaseItems,
            filter,
        }),
        [allDatabaseItems, filteredDatabaseItems, filter]
    );

    return (
        <DatabaseFilterContext value={contextValue}>
            {children}
        </DatabaseFilterContext>
    );
}

export function useDatabaseFilterContext() {
    const context = useContext(DatabaseFilterContext);
    if (!context) {
        throw new Error(
            'useDatabaseFilterContext must be used inside <DatabaseFilterProvider>'
        );
    }
    return context;
}
