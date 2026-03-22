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
                const isMaxInput =
                    category === 'reputation' || category === 'cost';
                const selectedValues = Array.from(optionMap.entries())
                    .filter(([, value]) => value !== false && value !== '')
                    .map(([option, value]) => ({ option, value }));

                if (selectedValues.length === 0) continue;

                if (isMaxInput) {
                    if (category === 'reputation') {
                        const factionValue = item.faction;
                        const levelValue = item.level;
                        if (factionValue && levelValue !== undefined) {
                            const maxLevel = optionMap.get(factionValue);
                            if (
                                typeof maxLevel === 'string' &&
                                maxLevel !== ''
                            ) {
                                if (levelValue > Number(maxLevel)) return false;
                            }
                        }
                    } else if (category === 'cost') {
                        const currencyValue = item.currency;
                        const costValue = item.cost;
                        if (currencyValue && costValue !== undefined) {
                            const maxAmount = optionMap.get(currencyValue);
                            if (
                                typeof maxAmount === 'string' &&
                                maxAmount !== ''
                            ) {
                                if (costValue > Number(maxAmount)) return false;
                            }
                        }
                    }
                    continue;
                }

                const selectedOptions = selectedValues.map((sv) => sv.option);
                const itemValue = item[category as keyof DatabaseItem];
                if (itemValue === undefined || itemValue === null) return false;
                if (Array.isArray(itemValue)) {
                    if (
                        !itemValue.some((val) =>
                            selectedOptions.includes(String(val))
                        )
                    )
                        return false;
                } else {
                    if (!selectedOptions.includes(String(itemValue)))
                        return false;
                }
            }
            return item.name
                .toLowerCase()
                .includes(
                    urlParameters.get('query')?.toLowerCase() ??
                        ''.trim().toLowerCase()
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
                for (const [option, value] of optionMap.entries()) {
                    if (value === true) {
                        params.append(category, option);
                    } else if (typeof value === 'string' && value !== '') {
                        params.append(category, `${option}:${value}`);
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
