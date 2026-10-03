import { DatabaseItem, DatabaseListing } from '@/types/database-item';
import { Filter } from '@/types/filter';

/** The fields of an item that can be filtered by one or multiple options. */
export const itemFilterFields = [
    'type',
    'statsType',
    'upgradeItem',
    'colours',
] as const;

/** The fields of a listing that can be filtered by one or multiple options. */
export const listingFilterFields = [
    'shop',
    'bundle',
    'faction',
    'currency',
] as const;

/** The fields of a listing that limit the `level` or `cost` of a max input. */
const maxInputFields = {
    reputation: { optionField: 'faction', valueField: 'level' },
    cost: { optionField: 'currency', valueField: 'cost' },
} as const;

export function getAvailability(item: DatabaseItem): string {
    return item.available ? 'Available' : 'Unavailable';
}

function getSelectedOptions(optionMap: Map<string, string | boolean>) {
    return Array.from(optionMap.entries())
        .filter(([, value]) => value !== false && value !== '')
        .map(([option]) => option);
}

function matchesOptions(value: unknown, selectedOptions: string[]): boolean {
    if (selectedOptions.length === 0) return true;
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) {
        return value.some((entry) => selectedOptions.includes(String(entry)));
    }
    return selectedOptions.includes(String(value));
}

function matchesListing(listing: DatabaseListing, filter: Filter): boolean {
    for (const [category, optionMap] of filter.entries()) {
        if (category in maxInputFields) {
            const { optionField, valueField } =
                maxInputFields[category as keyof typeof maxInputFields];
            const option = listing[optionField];
            const value = listing[valueField];
            const max = option ? optionMap.get(option) : undefined;
            if (
                value !== undefined &&
                typeof max === 'string' &&
                max !== '' &&
                value > Number(max)
            )
                return false;
            continue;
        }

        const field = listingFilterFields.find((field) => field === category);
        if (!field) continue;
        if (!matchesOptions(listing[field], getSelectedOptions(optionMap)))
            return false;
    }
    return true;
}

/**
 * Check whether an item passes the filter. Options of the same category widen
 * the selection while categories narrow it down. Everything that concerns how
 * to obtain an item, like its shop and cost, has to be met by the same listing.
 */
export function matchesFilter(item: DatabaseItem, filter: Filter): boolean {
    for (const [category, optionMap] of filter.entries()) {
        const field = itemFilterFields.find((field) => field === category);
        if (!field && category !== 'availability') continue;
        const value = field ? item[field] : getAvailability(item);
        if (!matchesOptions(value, getSelectedOptions(optionMap))) return false;
    }
    return item.listings.some((listing) => matchesListing(listing, filter));
}
