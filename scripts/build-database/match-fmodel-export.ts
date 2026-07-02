import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { FiddlerExportParsed } from './types';
import { FmodelItemExport, parseFmodelExport } from './parse-fmodel-export';
import { prepareImages } from './prepare-images';

const itemsRoot = 'fmodel/Output/Exports/ThunderHorse/Content/Blueprints/Items';
const contentRoot = 'fmodel/Output/Exports/ThunderHorse/Content/';

interface ItemListDataTable {
    Rows: Record<
        string,
        {
            AssetId?: number;
            ItemClass?: {
                ObjectPath?: string;
            };
        }
    >;
}

/**
 * Build a legacy_id -> fmodel export path index from every `DT_*ItemsList`
 * data table under `Items`. A row's `AssetId` matches the `legacy_id` Fiddler
 * carries in its `assets_details`, while `ItemClass.ObjectPath` points to the
 * fmodel export that actually backs it. Matching on this numeric id instead
 * of the row/entity name avoids divergent naming between the two sources
 * (e.g. DT key "Legwraps_Christmas" vs file BP_Legwraps_TendonWraps_Christmas,
 * or DT "Shirt_Turtleneck_Blue" vs Fiddler's "Shirt_Turtleneck_Navy").
 *
 * AssetId 0 is a placeholder shared by non-purchasable rows (e.g. character
 * shape presets) and is skipped to avoid false collisions.
 */
async function buildFmodelIndex(root: string): Promise<Map<number, string>> {
    const files = (await readdir(root, { recursive: true })) as string[];
    const dataTables = files.filter((file) =>
        path.basename(file).startsWith('DT_')
    );
    const index = new Map<number, string>();

    for (const dataTable of dataTables) {
        const [{ Rows: rows }] = JSON.parse(
            await readFile(path.join(root, dataTable), 'utf8')
        ) as ItemListDataTable[];

        for (const row of Object.values(rows)) {
            const objectPath = row.ItemClass?.ObjectPath;
            if (!objectPath || !row.AssetId) continue;

            const filePath = path.join(
                contentRoot,
                objectPath.replace(/^\/Game\//, '').replace(/\.\d+$/, '') +
                    '.json'
            );

            const existing = index.get(row.AssetId);
            if (existing && existing !== filePath) {
                throw new Error(
                    `Conflicting fmodel export for AssetId ${row.AssetId} (${existing} vs ${filePath}, from ${dataTable})`
                );
            }
            index.set(row.AssetId, filePath);
        }
    }

    return index;
}

export async function matchFmodelExport(
    fiddlerExportParsed: FiddlerExportParsed
) {
    const index = await buildFmodelIndex(itemsRoot);
    const unmatched: string[] = [];
    const imageSources = new Map<string, string>();

    for (const [key, entry] of Object.entries(fiddlerExportParsed)) {
        const filePath = index.get(Number(key));

        if (!filePath) {
            unmatched.push(key);
            continue;
        }

        const fmodelExport = JSON.parse(
            await readFile(filePath, 'utf8')
        ) as FmodelItemExport;

        const itemDirectory = path
            .relative(itemsRoot, path.dirname(filePath))
            .split(path.sep)
            .join('/');

        Object.assign(
            entry,
            parseFmodelExport(
                fmodelExport,
                itemDirectory,
                contentRoot,
                imageSources
            )
        );
    }

    if (unmatched.length > 0) {
        console.warn(
            `No fmodel export found for ${unmatched.length} key(s):`,
            unmatched
        );
    }

    // Leave disabled for the time being to save resources.
    await prepareImages(imageSources);

    return fiddlerExportParsed;
}
