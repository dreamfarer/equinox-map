import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseCatalogKey } from './parse-catalog-key';
import { parseEntry } from './parse-entry';
import { FiddlerExport, FiddlerExportParsed } from './types';

const excludedKeys = new Set(['premium_currency', 'premium_riding_pass']);

async function getFilePaths(dir: string): Promise<string[]> {
    return (await readdir(dir, { recursive: true })).map((file) =>
        path.join(dir, file)
    );
}

async function buildDatabase() {
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
            const { name, kind, cost, currency } = parseEntry(entry, filePath);

            fiddlerExportParsed[entry.entity_name] = {
                name,
                level,
                faction,
                cost,
                currency,
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
