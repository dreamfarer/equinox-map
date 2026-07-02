import { readdir, readFile } from 'node:fs/promises';
import { parseCatalogKey } from './parse-catalog-key';
import { parseEntry } from './parse-entry';
import { FiddlerExport, FiddlerExportParsed } from './types';
import { parseAssets } from './parse-assets';
import path from 'node:path';

const excludedKeys = new Set(['premium_currency', 'premium_riding_pass']);
const excludedCatalogIds = new Set([
    '01KH1ENR3QAPFP1SJ6Y73RHJZ0',
    '01KH1EQP5K2RQJ78RB5CC9K4NN',
    '01KHBFJ0N7ARSHVQX1M5WBBMW1',
    '01KHBJ9TJXCESDHAXW293KPYJC',
    '01KHBJE6W5S3BAAWSNYY2HX3RE',
    '01KHBJFXT5BYZXSM7HTXE6GD46',
    '01KNPV9D6W245KVKKEHVMNXTT3',
    '01KNPVB2JNVA3D79TT3B5BC426',
    '01KTPN1A2QFWPP3SXNQXRMCSYB',
    '01KTPN4MHGAJV6A99ZVFPJCZCN',
]);

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
        const assetDetails = Array.isArray(fiddlerExport.assets_details)
            ? fiddlerExport.assets_details
            : [];

        for (const entry of fiddlerExport.entries) {
            const { name, kind, cost, currency, catalogueId } = parseEntry(
                entry,
                filePath
            );

            if (excludedCatalogIds.has(catalogueId)) continue;

            const base = { level, faction, cost, currency, shop };

            for (const asset of parseAssets(catalogueId, assetDetails)) {
                fiddlerExportParsed[asset.legacyId] = {
                    ...base,
                    ...(kind === 'group' ? { bundle: name } : {}),
                };
            }
        }
    }

    return fiddlerExportParsed;
}
