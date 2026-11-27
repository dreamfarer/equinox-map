import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { cataloguesDir } from './paths';

type Price = {
    amount: string;
    currency_id: string;
    currency_name: string;
};

type Entry = {
    entity_kind: string;
    entity_name: string;
    catalog_listing_id: string;
    purchasable: boolean;
    prices: Price[];
};

type AssetDetails = {
    name: string;
    legacy_id: number;
    catalog_listing_id: string;
};

/** A LootLocker catalogue as returned by `/game/catalog/key/<key>/prices`. */
export type CatalogueExport = {
    catalog: { key: string };
    entries: Entry[];
    assets_details: AssetDetails[] | null;
    pagination: { total: number; next_cursor?: string | null };
};

/**
 * Read the catalogues downloaded by `database:fetch`.
 * @returns The catalogues by their LootLocker key.
 */
export function readCatalogueExports(): Map<string, CatalogueExport> {
    if (!existsSync(cataloguesDir)) {
        throw new Error(
            `${cataloguesDir} doesn't exist. Run "npm run database:fetch" first.`
        );
    }

    // A manual export with Fiddler Classic numbers the responses in the order
    // they were captured, so the most recent capture of a catalogue comes last.
    const files = readdirSync(cataloguesDir)
        .filter((file) => file.endsWith('.json'))
        .sort(new Intl.Collator(undefined, { numeric: true }).compare);
    const catalogues = new Map<string, CatalogueExport>();

    for (const file of files) {
        let catalogue: CatalogueExport;
        try {
            catalogue = JSON.parse(
                readFileSync(path.join(cataloguesDir, file), 'utf8')
            );
        } catch {
            throw new Error(
                `${file} isn't valid JSON. Run "npm run database:fetch" again.`
            );
        }

        const key = catalogue?.catalog?.key;
        if (!key || !Array.isArray(catalogue.entries)) {
            console.warn(`Skipped ${file} because it isn't a catalogue.`);
            continue;
        }
        if (catalogue.entries.length < catalogue.pagination.total) {
            throw new Error(
                `${file} only contains ${catalogue.entries.length} of the ${catalogue.pagination.total} entries of ${key}.`
            );
        }
        if (catalogues.has(key)) {
            console.warn(`${key} was exported more than once, using ${file}.`);
        }
        catalogues.set(key, catalogue);
    }

    return catalogues;
}
