import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const excludedKeys = new Set(['premium_currency', 'premium_riding_pass']);
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
const baseDir = 'fiddler-classic/Output/Exports/';

// TODO: How to manage DLCs distributed through Steam?
interface CatalogEntry {
    shop?: string;
    faction?: string;
    level?: number;
}

interface FactionInfo {
    shop: string;
    faction: string;
}

const factionMapping: Record<string, FactionInfo> = {
    alderwood_farms: {
        shop: "Kathy's Trendy Threads",
        faction: 'Alderwood Farms',
    },
    alderwood_town: {
        shop: "March's Tack Shop (Wendy)",
        faction: 'Alderwood Downtown',
    },
    alderwood_wilds: { shop: 'Equicraft Forge', faction: 'Alderwood Wilds' },
    alderwood_equestrians: {
        shop: "Thomas Pratt's Store",
        faction: 'Alderwood Equestrians',
    },
    alderwood_fishermen: {
        shop: "Robert's Shop",
        faction: 'Alderwood Fishermen',
    },
};

const nonFactionMapping: Record<string, CatalogEntry> = {
    premium_mounts_v1_0: { shop: 'Premium' },
    premium_bundles_2: { shop: 'Premium' },
    premium_riding_pass: { shop: 'Premium' },
    premium_early_access: { shop: 'Premium' },
    premium_gear: { shop: 'Premium' },
    multiplayer_activities_shop: { shop: "Danny's Token Trade" },
    riding_club_shop_2: { shop: "Riding Club's Shop" },
};

function resolveCatalogEntry(key: string): CatalogEntry {
    const factionMatch = key.match(/^faction_(.+)_level_(\d+)$/);
    if (factionMatch) {
        const [, slug, levelStr] = factionMatch;
        const info = factionMapping[slug];
        if (info === undefined) {
            throw new Error(
                `No faction mapping for slug "${slug}" (from key "${key}")`
            );
        }
        return {
            shop: info.shop,
            faction: info.faction,
            level: Number(levelStr),
        };
    }
    if (Object.hasOwn(nonFactionMapping, key)) {
        return nonFactionMapping[key];
    }
    throw new Error(`No catalog mapping for ${key}`);
}

type FiddlerEntry = {
    id: string;
    level?: number;
    faction?: string;
    cost?: number;
    currency?: string;
    shop?: string;
};

type FiddlerExportParsed = Record<string, FiddlerEntry>;

type FiddlerExport = {
    entries: [
        {
            entity_name: string;
            prices: [
                {
                    amount: number;
                    currency_code: string;
                },
            ];
        },
    ];
    catalog: {
        key: string;
    };
};

// TODO: Check for double price defs
// TODO: Check for bundles and dereference content
async function buildDatabase() {
    const fiddlerExportParsed: FiddlerExportParsed = {};
    const fiddlerExportFilePaths = (
        await readdir(baseDir, { recursive: true })
    ).map((file) => path.join(baseDir, file));
    for (const filePath of fiddlerExportFilePaths) {
        const fiddlerExport = JSON.parse(
            await readFile(filePath, 'utf8')
        ) as FiddlerExport;
        if (excludedKeys.has(fiddlerExport.catalog.key)) continue;
        const { shop, faction, level } = resolveCatalogEntry(
            fiddlerExport.catalog.key
        );
        for (const entry of fiddlerExport.entries) {
            const currencyCode = entry.prices[0].currency_code;
            if (!Object.hasOwn(currencies, currencyCode)) {
                throw new Error(
                    `No currency mapping for ${currencyCode} (file: ${filePath}, entity: ${entry.entity_name})`
                );
            }
            fiddlerExportParsed[entry.entity_name] = {
                id: entry.entity_name,
                level,
                faction,
                cost: entry.prices[0].amount,
                currency: currencies[currencyCode],
                shop,
            };
        }
    }
    console.log(fiddlerExportParsed);
}

buildDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
});
