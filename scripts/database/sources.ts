import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { coloursPath, extrasPath, itemsPath } from './paths';
import { Colours, ExtraListing, ImportedItem, ImportedListing } from './types';

/**
 * The colour new items get in `colours.json` until their actual colours are
 * filled in by hand.
 */
export const placeholderColour = '';

async function readJson<T>(filePath: string, fallback?: T): Promise<T> {
    if (fallback !== undefined && !existsSync(filePath)) return fallback;
    return JSON.parse(await readFile(filePath, 'utf8')) as T;
}

/**
 * Read the files in `public/database` the database is built from.
 * @returns The imported items, their colours, and the extra listings.
 */
export async function readSources(): Promise<{
    items: ImportedItem[];
    colours: Colours;
    extras: ExtraListing[];
}> {
    if (!existsSync(itemsPath)) {
        throw new Error(
            `${itemsPath} doesn't exist. Run "npm run database:import" first.`
        );
    }
    return {
        items: await readJson<ImportedItem[]>(itemsPath),
        colours: await readJson<Colours>(coloursPath, {}),
        extras: await readJson<ExtraListing[]>(extrasPath, []),
    };
}

/**
 * Collect every listing of an item: the ones of the game and the extra ones.
 * @param item - The imported item.
 * @param extras - The extra listings.
 * @returns All listings of the item.
 */
export function collectListings(
    item: ImportedItem,
    extras: ExtraListing[]
): ImportedListing[] {
    return [
        ...item.listings,
        ...extras
            .filter((extra) => extra.items.includes(item.id))
            .map(({ shop, faction, level, bundle, cost, currency }) => ({
                shop,
                faction,
                level,
                bundle,
                cost,
                currency,
                available: true,
            })),
    ];
}
