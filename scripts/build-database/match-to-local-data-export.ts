import path from 'node:path';
import { buildAsset } from './build-asset';
import { AutomatedDatabaseItem } from './types';
import { buildAssetPathIndex } from './build-asset-path-index';

const assetsRoot =
    'fmodel/Output/Exports/ThunderHorse/Content/Blueprints/Items';
const contentRoot = 'fmodel/Output/Exports/ThunderHorse/Content/';

/**
 * Match the FModel export (*local data*) to the Fiddle export (*server data*)
 * @param automatedDatabaseItems - The generated database based on the Fiddle export
 * @param imageSources - The shared map to collect all thumbnail paths.
 */
export async function matchToLocalDataExport(
    automatedDatabaseItems: Record<string, AutomatedDatabaseItem>,
    imageSources: Map<string, string>
) {
    const index = await buildAssetPathIndex(assetsRoot, contentRoot);
    const unmatched: string[] = [];

    for (const [key, entry] of Object.entries(automatedDatabaseItems)) {
        const filePath = index.get(Number(key));

        if (!filePath) {
            unmatched.push(key);
            continue;
        }

        const itemDirectory = path
            .relative(assetsRoot, path.dirname(filePath))
            .split(path.sep)
            .join('/');

        Object.assign(
            entry,
            buildAsset(filePath, itemDirectory, contentRoot, imageSources)
        );
    }

    if (unmatched.length > 0) {
        console.warn(
            `No FModel export found for ${unmatched.length} key(s):`,
            unmatched
        );
    }
}
