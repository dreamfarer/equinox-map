import path from 'node:path';
import {
    listPackages,
    readClassDefaults,
    readEnum,
    readPackage,
    readSoftPath,
    readText,
    resolveObject,
    toExportPath,
} from './fmodel';

/** An item as defined by the game, without any information on how to obtain it. */
export type GameItem = {
    id: string;
    name: string;
    type: string;
    statsType?: string;
    upgradeItem?: string;
    /** The path to the exported texture of the item's icon. */
    texturePath?: string;
};

/** What the game requires to access a catalogue and which shop offers it. */
export type GameCatalogue = {
    shop: string;
    faction?: string;
    level?: number;
};

type ItemListRow = { AssetId?: number; ItemClass?: unknown };
type ShopCatalogue = { ID: string; Conditions?: unknown[] };

/** The directories of `/Game/Blueprints/Items` whose items belong in the database. */
const itemDirectories = ['Clothing', 'Tack', 'FastTravel'];

/** The slot of items that inherit it from their C++ class instead of storing it. */
const nativeSlots: Record<string, string> = {
    ShirtItem: 'Shirt',
    ShoesItem: 'Shoes',
    FastTravelItem: 'FastTravel',
};

/**
 * Shop names that are obviously wrong in the game data. `DA_Shop_PremiumBundles`
 * carries the name of the mounts shop, which would be misleading for bundles.
 */
const shopNameOverrides: Record<string, string> = {
    DA_Shop_PremiumBundles: 'Premium Shop Bundles',
};

function splitPascalCase(value: string): string {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

function readDisplayName(gamePath: string): string {
    const [asset] = readPackage(gamePath);
    const name = readText(asset.Properties?.DisplayName);
    if (!name) throw new Error(`${gamePath} doesn't have a display name.`);
    return name;
}

/**
 * Build a single item from its blueprint class.
 * @param id - The name of the item's row in its item list.
 * @param itemClass - The reference to the item's blueprint class.
 * @returns The item with everything the game knows about it.
 */
function readItem(id: string, itemClass: unknown): GameItem {
    const { properties, nativeClass } = readClassDefaults(itemClass);

    const name = readText(properties.DisplayName);
    if (!name) throw new Error(`${id} doesn't have a display name.`);

    const slot = readEnum(properties.Slot) ?? nativeSlots[nativeClass];
    if (!slot) {
        throw new Error(
            `Can't determine the slot of ${id}. Add the default slot of "${nativeClass}" to nativeSlots.`
        );
    }
    const item: GameItem = {
        id,
        name,
        type: splitPascalCase(slot.replace(/Cosmetic$/, '')),
    };

    // Items in a cosmetic slot neither provide stats nor can be upgraded, even
    // though some of them still carry the stats of the item they were copied from.
    const statsType = readEnum(properties.BaseStat);
    const hasStats =
        !slot.endsWith('Cosmetic') &&
        Boolean(properties.StatsProgression) &&
        statsType !== 'None';
    if (hasStats) {
        if (!statsType) {
            throw new Error(`Can't determine the stats type of ${id}.`);
        }
        item.statsType = statsType;

        const upgradeCosts = resolveObject(properties.UpgradeCosts);
        const resource = readSoftPath(upgradeCosts?.Properties?.Resource);
        if (resource) item.upgradeItem = readDisplayName(resource);
    }

    const texture = readSoftPath(properties.Image);
    if (texture) item.texturePath = `${toExportPath(texture)}.png`;

    return item;
}

/**
 * Index the rows of every item list (`DT_*`) of the game.
 * @returns Functions to look up an item by the name of its row or by its
 * LootLocker asset ID. They return `undefined` for unknown rows and `null` for
 * rows that exist but don't belong in the database, like mane colours.
 */
export function readItems(): {
    byId: (id: string) => GameItem | null | undefined;
    byAssetId: (assetId: number) => GameItem | null | undefined;
} {
    const rows = new Map<string, { itemClass: unknown; inDatabase: boolean }>();
    const assetIds = new Map<number, string>();
    const items = new Map<string, GameItem>();

    for (const gamePath of listPackages('/Game/Blueprints/Items')) {
        if (!path.posix.basename(gamePath).startsWith('DT_')) continue;

        const [directory] = gamePath
            .slice('/Game/Blueprints/Items/'.length)
            .split('/');
        const [table] = readPackage(gamePath);
        const tableRows = (table.Rows ?? {}) as Record<string, ItemListRow>;

        for (const [id, row] of Object.entries(tableRows)) {
            if (!row.ItemClass) continue;
            if (rows.has(id)) {
                throw new Error(`${id} is defined by multiple item lists.`);
            }
            rows.set(id, {
                itemClass: row.ItemClass,
                inDatabase: itemDirectories.includes(directory),
            });

            if (!row.AssetId) continue;
            if (assetIds.has(row.AssetId)) {
                throw new Error(
                    `${id} and ${assetIds.get(row.AssetId)} share the asset ID ${row.AssetId}.`
                );
            }
            assetIds.set(row.AssetId, id);
        }
    }

    const byId = (id: string) => {
        const row = rows.get(id);
        if (!row) return undefined;
        if (!row.inDatabase) return null;
        if (!items.has(id)) items.set(id, readItem(id, row.itemClass));
        return items.get(id);
    };

    return {
        byId,
        byAssetId: (assetId) => {
            const id = assetIds.get(assetId);
            return id === undefined ? undefined : byId(id);
        },
    };
}

/**
 * Read which shop offers each catalogue and what reputation it requires.
 * @returns The catalogues by their LootLocker key and the keys each shop consists of.
 */
export function readCatalogues(): {
    catalogues: Map<string, GameCatalogue[]>;
    shops: Map<string, string[]>;
} {
    const catalogues = new Map<string, GameCatalogue[]>();
    const shops = new Map<string, string[]>();

    for (const gamePath of listPackages('/Game/Blueprints/Data/Shops')) {
        const shop = readPackage(gamePath).find(
            (object) => object.Type === 'ShopAsset'
        );
        if (!shop) continue;

        const name =
            shopNameOverrides[shop.Name] ?? readText(shop.Properties?.Name);
        if (!name) throw new Error(`${shop.Name} doesn't have a name.`);

        const shopCatalogues = (shop.Properties?.Catalogs ??
            []) as ShopCatalogue[];
        const parsed = shopCatalogues.map((catalogue) => {
            const requirement = (catalogue.Conditions ?? [])
                .map(resolveObject)
                .find((condition) => condition?.Properties?.FactionAsset);
            const faction = resolveObject(
                requirement?.Properties?.FactionAsset
            );
            return {
                key: catalogue.ID,
                faction: readText(faction?.Properties?.DisplayName),
                level: requirement?.Properties?.Step as number | undefined,
            };
        });

        // The first catalogue of a faction's shop has no requirement because
        // every player starts with reputation level 1.
        const shopFaction = parsed.find(({ faction }) => faction)?.faction;

        for (const { key, faction, level } of parsed) {
            const catalogue: GameCatalogue = { shop: name };
            if (shopFaction) {
                catalogue.faction = faction ?? shopFaction;
                catalogue.level = level ?? 1;
            }
            catalogues.set(key, [...(catalogues.get(key) ?? []), catalogue]);
        }
        shops.set(
            shop.Name,
            parsed.map(({ key }) => key)
        );
    }

    return { catalogues, shops };
}

/**
 * Read the display name of every currency.
 * @returns The display names by the LootLocker ID of the currency. An ID has
 * more than one name if the game reuses it for multiple currencies.
 */
export function readCurrencies(): Map<string, string[]> {
    const currencies = new Map<string, string[]>();

    for (const gamePath of listPackages('/Game/Blueprints/Data/Currency')) {
        const [currency] = readPackage(gamePath);
        const id = currency.Properties?.ID;
        if (typeof id !== 'string') continue;
        currencies.set(id, [
            ...(currencies.get(id) ?? []),
            readDisplayName(gamePath),
        ]);
    }

    return currencies;
}

/**
 * Read the display name of every bundle.
 * @returns The display names by the LootLocker name of the bundle.
 */
export function readBundles(): Map<string, string> {
    const bundles = new Map<string, string>();

    for (const gamePath of listPackages('/Game/Blueprints/Data/ShopBundles')) {
        const [bundle] = readPackage(gamePath);
        const key = bundle.Properties?.BundleKey;
        if (typeof key !== 'string') continue;
        bundles.set(key, readDisplayName(gamePath));
    }

    return bundles;
}
