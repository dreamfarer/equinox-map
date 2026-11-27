import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readCatalogueExports } from './catalogues';
import { addMissingColours, placeholderColours } from './colours';
import {
    GameItem,
    readBundles,
    readCatalogues,
    readCurrencies,
    readItems,
} from './game-data';
import { prepareIcons } from './icons';
import { extrasPath, itemsPath } from './paths';
import { ExtraListing, ImportedItem, ImportedListing } from './types';

type Items = ReturnType<typeof readItems>;

const collator = new Intl.Collator('en', { numeric: true });

function compareListings(a: ImportedListing, b: ImportedListing): number {
    return (
        Number(b.available) - Number(a.available) ||
        collator.compare(a.shop, b.shop) ||
        (a.level ?? 0) - (b.level ?? 0) ||
        collator.compare(a.bundle ?? '', b.bundle ?? '') ||
        collator.compare(a.currency, b.currency) ||
        a.cost - b.cost
    );
}

/**
 * Match the catalogues of LootLocker (_server data_) to the export of the game
 * files (_local data_): the catalogues know what each shop sells at which price, the
 * game files know everything else.
 * @param items - The items of the game.
 * @returns The listings of every item sold by a shop, by the item.
 */
function readListings(items: Items): Map<GameItem, ImportedListing[]> {
    const { catalogues, shops } = readCatalogues();
    const currencies = readCurrencies();
    const bundles = readBundles();
    const catalogueExports = readCatalogueExports();
    const listings = new Map<GameItem, ImportedListing[]>();

    for (const [key, catalogueExport] of catalogueExports) {
        const candidates = catalogues.get(key) ?? [];
        if (candidates.length !== 1) {
            throw new Error(
                candidates.length === 0
                    ? `No shop of the game offers the catalogue ${key}. Is the export of /Game/Blueprints/Data/Shops up to date?`
                    : `Multiple shops of the game offer the catalogue ${key}.`
            );
        }
        const [catalogue] = candidates;

        for (const entry of catalogueExport.entries) {
            if (entry.entity_kind === 'currency') continue;
            if (
                entry.entity_kind !== 'asset' &&
                entry.entity_kind !== 'group'
            ) {
                console.warn(
                    `Skipped ${entry.entity_name} of ${key} because "${entry.entity_kind}" entries are not supported.`
                );
                continue;
            }

            const assets = (catalogueExport.assets_details ?? []).filter(
                (asset) => asset.catalog_listing_id === entry.catalog_listing_id
            );

            for (const asset of assets) {
                const item = items.byAssetId(asset.legacy_id);
                if (item === undefined && !entry.purchasable) {
                    // LootLocker already lists upcoming content that the
                    // game files don't contain yet.
                    console.warn(
                        `Skipped ${asset.name} of ${key} because it is unknown to the game and can't be purchased yet.`
                    );
                    continue;
                }
                if (item === undefined) {
                    throw new Error(
                        `${asset.name} (${asset.legacy_id}) of ${key} is unknown to the game. Is the export of /Game/Blueprints/Items up to date?`
                    );
                }
                if (item === null) continue;

                const bundle =
                    entry.entity_kind === 'group'
                        ? bundles.get(entry.entity_name)
                        : undefined;
                if (entry.entity_kind === 'group' && !bundle) {
                    throw new Error(
                        `The bundle ${entry.entity_name} of ${key} is unknown to the game. Is the export of /Game/Blueprints/Data/ShopBundles up to date?`
                    );
                }

                if (entry.prices.length === 0) {
                    console.warn(
                        `Skipped ${entry.entity_name} of ${key} because it doesn't have a price.`
                    );
                }
                for (const price of entry.prices) {
                    const names = currencies.get(price.currency_id) ?? [];
                    if (names.length !== 1) {
                        throw new Error(
                            names.length === 0
                                ? `The currency ${price.currency_name} of ${key} is unknown to the game. Is the export of /Game/Blueprints/Data/Currency up to date?`
                                : `The currency ${price.currency_name} of ${key} is ambiguous: ${names.join(', ')}.`
                        );
                    }
                    listings.set(item, [
                        ...(listings.get(item) ?? []),
                        {
                            ...catalogue,
                            ...(bundle ? { bundle } : {}),
                            cost: Number(price.amount),
                            currency: names[0],
                            available: entry.purchasable,
                        },
                    ]);
                }
            }
        }
    }

    // A shop is spread over multiple catalogues, one per reputation level.
    // Missing one of them would silently drop its items from the database.
    for (const [shop, keys] of shops) {
        const exported = keys.filter((key) => catalogueExports.has(key));
        if (exported.length > 0 && exported.length < keys.length) {
            throw new Error(
                `${shop} is incomplete, the downloaded catalogues are missing: ${keys.filter((key) => !catalogueExports.has(key)).join(', ')}`
            );
        }
    }

    return listings;
}

/**
 * Read the items of listings the catalogues don't know about, like DLCs.
 * @param items - The items of the game.
 * @returns The items referenced by `extras.json`.
 */
function readExtraItems(items: Items): GameItem[] {
    if (!existsSync(extrasPath)) return [];

    const extras = JSON.parse(
        readFileSync(extrasPath, 'utf8')
    ) as ExtraListing[];

    return extras.flatMap((extra) =>
        extra.items.map((id) => {
            const item = items.byId(id);
            if (!item) {
                throw new Error(
                    `${id} of ${path.basename(extrasPath)} is not an item of the game.`
                );
            }
            return item;
        })
    );
}

function listingKey(listing: ImportedListing): string {
    return JSON.stringify([
        listing.shop,
        listing.faction,
        listing.level,
        listing.bundle,
        listing.currency,
    ]);
}

/**
 * Keep what the previous import knew but the game no longer offers, like the
 * items of an event that has ended: their listings are marked as unavailable
 * instead of being removed.
 * @param items - The items of the game.
 * @param listings - The current listings by the item, gets the past listings added.
 * @returns The items that are gone from the game files altogether.
 */
function keepPastListings(
    items: Items,
    listings: Map<GameItem, ImportedListing[]>
): ImportedItem[] {
    if (!existsSync(itemsPath)) return [];

    const previousItems = JSON.parse(
        readFileSync(itemsPath, 'utf8')
    ) as ImportedItem[];
    const goneItems: ImportedItem[] = [];

    for (const previous of previousItems) {
        const past = previous.listings.map((listing) => ({
            ...listing,
            available: false,
        }));
        if (past.length === 0) continue;

        const item = items.byId(previous.id);
        if (!item) {
            goneItems.push({ ...previous, listings: past });
            continue;
        }

        const current = listings.get(item) ?? [];
        const currentKeys = new Set(current.map(listingKey));
        const missing = past.filter(
            (listing) => !currentKeys.has(listingKey(listing))
        );
        if (missing.length > 0) listings.set(item, [...current, ...missing]);
    }

    return goneItems;
}

/**
 * Build `items.json` and the item icons from the exports of the game and add
 * new items to `colours.json`.
 */
async function importDatabase() {
    const items = readItems();
    const listings = readListings(items);
    for (const item of readExtraItems(items)) {
        if (!listings.has(item)) listings.set(item, []);
    }

    const goneItems = keepPastListings(items, listings);

    const texturePaths = new Set<string>();
    for (const item of listings.keys()) {
        if (item.texturePath) texturePaths.add(item.texturePath);
    }
    const imagePaths = await prepareIcons(
        texturePaths,
        goneItems.flatMap(({ imagePath }) => imagePath ?? [])
    );

    const importedItems = [...listings]
        .map(([{ texturePath, ...item }, itemListings]): ImportedItem => {
            const imagePath = texturePath && imagePaths.get(texturePath);
            const unique = new Map(
                itemListings.map((listing) => [
                    JSON.stringify(listing),
                    listing,
                ])
            );
            return {
                ...item,
                ...(imagePath ? { imagePath } : {}),
                listings: [...unique.values()].sort(compareListings),
            };
        })
        .concat(goneItems)
        .sort(
            (a, b) =>
                collator.compare(a.name, b.name) || collator.compare(a.id, b.id)
        );

    await mkdir(path.dirname(itemsPath), { recursive: true });
    await writeFile(itemsPath, JSON.stringify(importedItems, null, 4) + '\n');
    console.log(
        `Imported ${importedItems.length} item(s) with ${imagePaths.size} icon(s) to ${itemsPath}.`
    );

    const unavailable = importedItems.filter(({ listings }) =>
        listings.every(({ available }) => !available)
    );
    if (unavailable.length > 0) {
        console.log(
            `${unavailable.length} item(s) are kept although no shop offers them anymore${goneItems.length > 0 ? `, ${goneItems.length} of them are gone from the game files` : ''}.`
        );
    }

    const added = await addMissingColours(importedItems.map(({ id }) => id));
    if (added.length > 0) {
        console.log(
            `\nAdded ${added.length} item(s) to colours.json with the placeholder ${JSON.stringify(placeholderColours)}, replace it with their actual colours:\n${added.map((id) => `- ${id}`).join('\n')}`
        );
    }
}

importDatabase().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
