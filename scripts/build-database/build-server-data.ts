import { readFile } from 'node:fs/promises';
import { parseCatalogKey } from './parse-catalog-key';
import { parseEntry } from './parse-entry';
import { FiddlerExport, AutomatedDatabaseItem } from './types';
import { getAssetProperties } from './get-asset-properties';
import { getFilePaths } from '../../lib/get-file-paths';
import path from 'node:path';

const fiddlerExportDir = path.resolve(
    __dirname,
    '..',
    '..',
    'fiddler-classic/Output/Exports'
);
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

/**
 * Parse the Fiddler export (*server data*) and compress it to flat/per entry structure.
 * @returns Promise of the parsed Fiddler export.
 */
export async function buildServerData(): Promise<
    Record<string, AutomatedDatabaseItem>
> {
    const fiddlerExportParsed: Record<string, AutomatedDatabaseItem> = {};
    const filePaths = await getFilePaths(fiddlerExportDir);

    for (const filePath of filePaths) {
        const fiddlerExport = JSON.parse(
            await readFile(filePath, 'utf8')
        ) as FiddlerExport;

        if (excludedKeys.has(fiddlerExport.catalog.key)) continue;

        const { shop, faction, level } = parseCatalogKey(
            fiddlerExport.catalog.key
        );

        if (!fiddlerExport.assets_details) continue;

        for (const entry of fiddlerExport.entries) {
            const { name, kind, cost, currency, catalogueId } = parseEntry(
                entry,
                filePath
            );

            if (excludedCatalogIds.has(catalogueId)) continue;

            const base = { level, faction, cost, currency, shop };
            const assets = getAssetProperties(
                catalogueId,
                fiddlerExport.assets_details
            );
            for (const asset of assets) {
                fiddlerExportParsed[asset.id] = {
                    ...base,
                    ...(kind === 'group' ? { bundle: name } : {}),
                };
            }
        }
    }

    return fiddlerExportParsed;
}
