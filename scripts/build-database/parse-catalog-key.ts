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

/**
 * Parse a catalog.key from a Fiddler export.
 * @param key - The catalog.key to parse.
 * @returns The parsed cataloge entry (shop, faction, level).
 */
export function parseCatalogKey(key: string): CatalogEntry {
    const factionMatch = key.match(/^faction_(.+)_level_(\d+)$/);

    if (factionMatch) {
        const [, slug, levelStr] = factionMatch;
        const info = factionMapping[slug];

        if (!info) {
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
