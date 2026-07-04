import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

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

const contentRoot = 'fmodel/Output/Exports/ThunderHorse/Content/';

/**
 * Build an asset path index from every `DT_*ItemsList` in the FModel export.
 * @param root - The root directory to search for data tables.
 * @returns A map of asset ids to fmodel export paths.
 */
export async function buildAssetPathIndex(
    root: string
): Promise<Map<number, string>> {
    const files = (await readdir(root, { recursive: true })) as string[];
    const dataTablePaths = files.filter((file) =>
        path.basename(file).startsWith('DT_')
    );
    const index = new Map<number, string>();

    for (const dataTablePath of dataTablePaths) {
        const dataTable = await readFile(
            path.join(root, dataTablePath),
            'utf8'
        );
        const [{ Rows: rows }] = JSON.parse(dataTable) as ItemListDataTable[];

        for (const row of Object.values(rows)) {
            const rawAssetPath = row.ItemClass?.ObjectPath;

            if (!rawAssetPath || !row.AssetId) continue;

            const assetPath =
                rawAssetPath.replace(/^\/Game\//, '').replace(/\.\d+$/, '') +
                '.json';
            const filePath = path.join(contentRoot, assetPath);

            if (index.get(row.AssetId))
                throw Error(
                    `Duplicated AssetId ${row.AssetId} in ${filePath}, from ${dataTablePath}`
                );

            index.set(row.AssetId, filePath);
        }
    }

    return index;
}
