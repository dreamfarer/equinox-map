'use client';

import {
    createContext,
    useContext,
    useMemo,
    ReactNode,
    useCallback,
} from 'react';
import { DatabaseItem } from '@/types/database-item';
import { Filter } from '@/types/filter';
import { ReadonlyURLSearchParams } from 'next/dist/client/components/readonly-url-search-params';

type DatabaseValue = {
    filteredDatabaseItems: DatabaseItem[];
    allDatabaseItems: DatabaseItem[];
    filter: Filter;
    writeSearchQuery: (query: string) => void;
    writeFilter: (filter: Filter) => void;
    getClonedFilter: () => Filter;
    resetFilters: () => void;
};

type DatabaseProviderProps = {
    children: ReactNode;
    allDatabaseItems: DatabaseItem[];
    filter: Filter;
    urlParameters: ReadonlyURLSearchParams;
    pathname: string;
};

const DatabaseContext = createContext<DatabaseValue | null>(null);

export function DatabaseProvider({
    children,
    allDatabaseItems,
    filter,
    urlParameters,
    pathname,
}: Readonly<DatabaseProviderProps>) {
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
            return item.name
                .toLowerCase()
                .includes(
                    urlParameters.get('query')?.toLowerCase() ?? ''.trim().toLowerCase()
                );
        });
    }, [allDatabaseItems, filter, urlParameters]);

    const updateAddressBar = useCallback(
        (params: URLSearchParams) => {
            const nextUrl = params.toString()
                ? `${pathname}?${params.toString()}`
                : pathname;
            window.history.replaceState(null, '', nextUrl);
        },
        [pathname]
    );

    const writeSearchQuery = useCallback(
        (query: string) => {
            const params = new URLSearchParams(urlParameters.toString());
            if (query.trim()) {
                params.set('query', query);
            } else {
                params.delete('query');
            }
            updateAddressBar(params);
        },
        [updateAddressBar, urlParameters]
    );

    const writeFilter = useCallback(
        (filter: Filter) => {
            const params = new URLSearchParams(urlParameters.toString());
            for (const [category] of filter.entries()) {
                params.delete(category);
            }
            for (const [category, optionMap] of filter.entries()) {
                for (const [option, selected] of optionMap.entries()) {
                    if (selected) {
                        params.append(category, option);
                    }
                }
            }
            updateAddressBar(params);
        },
        [updateAddressBar, urlParameters]
    );

    const resetFilters = useCallback(() => {
        const params = new URLSearchParams(urlParameters.toString());
        for (const category of filter.keys()) {
            params.delete(category);
        }
        updateAddressBar(params);
    }, [filter, updateAddressBar, urlParameters]);

    const getClonedFilter = useCallback(() => {
        return new Map(
            Array.from(filter.entries()).map(([category, optionMap]) => [
                category,
                new Map(optionMap),
            ])
        );
    }, [filter]);

    const contextValue = useMemo<DatabaseValue>(
        () => ({
            filteredDatabaseItems,
            allDatabaseItems,
            filter,
            writeSearchQuery,
            writeFilter,
            getClonedFilter,
            resetFilters,
        }),
        [
            filteredDatabaseItems,
            allDatabaseItems,
            filter,
            writeSearchQuery,
            writeFilter,
            getClonedFilter,
            resetFilters,
        ]
    );

    return <DatabaseContext value={contextValue}>{children}</DatabaseContext>;
}

export function useDatabaseContext() {
    const context = useContext(DatabaseContext);
    if (!context) {
        throw new Error(
            'useDatabaseFilterContext must be used inside <DatabaseProvider>'
        );
    }
    return context;
}
