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
 * Match the Fiddler Classic export (_server data_) to the FModel export
 * (_local data_): the catalogues know what each shop sells at which price, the
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
                    ? `No shop of the game offers the catalogue ${key}. Is the FModel export of /Game/Blueprints/Data/Shops up to date?`
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
                if (item === undefined) {
                    throw new Error(
                        `${asset.name} (${asset.legacy_id}) of ${key} is unknown to the game. Is the FModel export of /Game/Blueprints/Items up to date?`
                    );
                }
                if (item === null) continue;

                const bundle =
                    entry.entity_kind === 'group'
                        ? bundles.get(entry.entity_name)
                        : undefined;
                if (entry.entity_kind === 'group' && !bundle) {
                    throw new Error(
                        `The bundle ${entry.entity_name} of ${key} is unknown to the game. Is the FModel export of /Game/Blueprints/Data/ShopBundles up to date?`
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
                                ? `The currency ${price.currency_name} of ${key} is unknown to the game. Is the FModel export of /Game/Blueprints/Data/Currency up to date?`
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
                `${shop} is incomplete, the Fiddler Classic export is missing: ${keys.filter((key) => !catalogueExports.has(key)).join(', ')}`
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

    const texturePaths = new Set<string>();
    for (const item of listings.keys()) {
        if (item.texturePath) texturePaths.add(item.texturePath);
    }
    const imagePaths = await prepareIcons(texturePaths);

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
        .sort(
            (a, b) =>
                collator.compare(a.name, b.name) || collator.compare(a.id, b.id)
        );

    await mkdir(path.dirname(itemsPath), { recursive: true });
    await writeFile(itemsPath, JSON.stringify(importedItems, null, 4) + '\n');
    console.log(
        `Imported ${importedItems.length} item(s) with ${imagePaths.size} icon(s) to ${itemsPath}.`
    );

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
