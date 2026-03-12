import { Filter, FilterOptions } from '@/types/filter';
import { DatabaseItem } from '@/types/database-item';

export function buildFilterOptions(
    allDatabaseItems: DatabaseItem[]
): FilterOptions {
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

export function buildInitialFilters(filterOptions: FilterOptions): Filter {
    const initial: Filter = new Map();
    filterOptions.forEach((options, category) => {
        const optionMap = new Map<string, boolean>();
        options.forEach((option) => optionMap.set(option, false));
        initial.set(category, optionMap);
    });
    return initial;
}

export function buildFilterFromSearchParams(
    searchParams: URLSearchParams,
    filterOptions: FilterOptions
): Filter {
    const filter = buildInitialFilters(filterOptions);
    for (const [category, optionMap] of filter.entries()) {
        const selectedOptions = searchParams.getAll(category);
        for (const option of optionMap.keys()) {
            optionMap.set(option, selectedOptions.includes(option));
        }
    }
    return filter;
}

export function writeFilterToSearchParams(
    params: URLSearchParams,
    filter: Filter
): URLSearchParams {
    const nextParams = new URLSearchParams(params.toString());
    for (const [category] of filter.entries()) {
        nextParams.delete(category);
    }
    for (const [category, optionMap] of filter.entries()) {
        for (const [option, selected] of optionMap.entries()) {
            if (selected) {
                nextParams.append(category, option);
            }
        }
    }
    return nextParams;
}

export function cloneFilter(filter: Filter): Filter {
    return new Map(
        Array.from(filter.entries()).map(([category, optionMap]) => [
            category,
            new Map(optionMap),
        ])
    );
}

export function updateAddressBar(params: URLSearchParams, pathname: string) {
    const nextUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
    window.history.replaceState(null, '', nextUrl);
}
