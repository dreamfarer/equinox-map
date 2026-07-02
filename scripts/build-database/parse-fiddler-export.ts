import { readdir, readFile } from 'node:fs/promises';
import { parseCatalogKey } from './parse-catalog-key';
import { parseEntry } from './parse-entry';
import { FiddlerExport, FiddlerExportParsed } from './types';
import { parseBundle } from './parse-bundle';
import path from 'node:path';

const excludedKeys = new Set(['premium_currency', 'premium_riding_pass']);

async function getFilePaths(dir: string): Promise<string[]> {
    return (await readdir(dir, { recursive: true })).map((file) =>
        path.join(dir, file)
    );
}

export async function parseFiddlerExport() {
    const fiddlerExportParsed: FiddlerExportParsed = {};
    const filePaths = await getFilePaths('fiddler-classic/Output/Exports/');

    for (const filePath of filePaths) {
        const fiddlerExport = JSON.parse(
            await readFile(filePath, 'utf8')
        ) as FiddlerExport;

        if (excludedKeys.has(fiddlerExport.catalog.key)) continue;

        const { shop, faction, level } = parseCatalogKey(
            fiddlerExport.catalog.key
        );

        for (const entry of fiddlerExport.entries) {
            const { name, kind, cost, currency, catalogueId } = parseEntry(
                entry,
                filePath
            );

            const base = { level, faction, cost, currency, shop };
            if (kind === 'group') {
                for (const assetName of parseBundle(
                    catalogueId,
                    fiddlerExport.assets_details
                )) {
                    fiddlerExportParsed[assetName] = {
                        ...base,
                        bundle: name,
                    };
                }
            } else {
                fiddlerExportParsed[entry.entity_name] = { ...base };
            }
        }
    }

    return fiddlerExportParsed;
}
