import { Entry } from './types';

const currencies: Record<string, string> = {
    cgd: 'Silver Sols',
    eac: 'Early Access Coins',
    crm: 'Gold Alders',
    slr: 'Sunflowers',
    mpt: 'Activity Tokens',
    rcs: 'Red Ribbons',
    rcb: 'Yellow Ribbons',
    rcg: 'Blue Ribbons',
};

/**
 * Parse an entry from entries in a Fiddler export.
 * @param entry - The entry from entries to parse.
 * @param filePath - The path to the Fiddler export file.
 * @returns The parsed entry (name, kind, cost, currency).
 */
export function parseEntry(
    entry: Entry,
    filePath: string
): { name: string; kind: string; cost: number; currency: string } {
    if (entry.prices.length > 1) {
        throw new Error(
            `Multiple price definitions (file: ${filePath}, entity: ${entry.entity_name})`
        );
    }
    const currencyCode = entry.prices[0].currency_code;
    if (!Object.hasOwn(currencies, currencyCode)) {
        throw new Error(
            `No currency mapping for ${currencyCode} (file: ${filePath}, entity: ${entry.entity_name})`
        );
    }

    return {
        name: entry.entity_name,
        kind: entry.entity_kind,
        cost: entry.prices[0].amount,
        currency: currencies[currencyCode],
    };
}
