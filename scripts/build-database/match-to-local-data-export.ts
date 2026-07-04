import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { FmodelItemExport, parseFmodelExport } from './parse-fmodel-export';
import { prepareImages } from './prepare-images';
import { AutomatedDatabaseItem } from '@/scripts/build-database/types';
import { buildAssetPathIndex } from './build-asset-path-index';

const itemsRoot = 'fmodel/Output/Exports/ThunderHorse/Content/Blueprints/Items';
const contentRoot = 'fmodel/Output/Exports/ThunderHorse/Content/';

export async function matchToLocalDataExport(
    automatedDatabaseItems: Record<string, AutomatedDatabaseItem>
) {
    const index = await buildAssetPathIndex(itemsRoot);
    const unmatched: string[] = [];
    const imageSources = new Map<string, string>();

    for (const [key, entry] of Object.entries(automatedDatabaseItems)) {
        const filePath = index.get(Number(key));

        if (!filePath) {
            unmatched.push(key);
            continue;
        }

        const fModelExport = JSON.parse(
            await readFile(filePath, 'utf8')
        ) as FmodelItemExport;

        const itemDirectory = path
            .relative(itemsRoot, path.dirname(filePath))
            .split(path.sep)
            .join('/');

        Object.assign(
            entry,
            parseFmodelExport(
                fModelExport,
                itemDirectory,
                contentRoot,
                imageSources
            )
        );
    }

    if (unmatched.length > 0) {
        console.warn(
            `No FModel export found for ${unmatched.length} key(s):`,
            unmatched
        );
    }

    // Leave disabled for the time being to save resources.
    // await prepareImages(imageSources);
}
