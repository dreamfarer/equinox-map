'use client';

import {
    createContext,
    useContext,
    useMemo,
    ReactNode,
    useState,
    useCallback,
    Dispatch,
    SetStateAction,
} from 'react';
import { DatabaseItem } from '@/types/database-item';
import { Filter, FilterOptions } from '@/types/filter';

type DatabaseFilterValue = {
    resetFilters: () => void;
    filteredDatabaseItems: DatabaseItem[];
    allDatabaseItems: DatabaseItem[];
    filter: Filter;
    setFilter: Dispatch<SetStateAction<Filter>>;
};

type DatabaseFilterProviderProps = {
    children: ReactNode;
    filterOptions: FilterOptions;
    allDatabaseItems: DatabaseItem[];
};

function buildInitialFilters(filterOptions: FilterOptions): Filter {
    const initial: Filter = new Map();
    filterOptions.forEach((options, category) => {
        const optionMap = new Map<string, boolean>();
        options.forEach((option) => optionMap.set(option, false));
        initial.set(category, optionMap);
    });
    return initial;
}

const DatabaseFilterContext = createContext<DatabaseFilterValue | null>(null);

export function DatabaseFilterProvider({
    children,
    filterOptions,
    allDatabaseItems,
}: Readonly<DatabaseFilterProviderProps>) {
    const [filter, setFilter] = useState<Filter>(() =>
        buildInitialFilters(filterOptions)
    );

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

    const resetFilters = useCallback(
        () => setFilter(buildInitialFilters(filterOptions)),
        [filterOptions]
    );

    const contextValue = useMemo<DatabaseFilterValue>(
        () => ({
            resetFilters,
            filteredDatabaseItems,
            allDatabaseItems,
            filter,
            setFilter,
        }),
        [allDatabaseItems, filteredDatabaseItems, resetFilters, filter]
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
