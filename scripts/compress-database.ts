import path from 'node:path';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { DatabaseItem } from '@/types/database-item';
import { validateDatabaseItem } from './validate-database';

const automatedDatabasePath = path.resolve(
    __dirname,
    '..',
    'public/database/automated-database.json'
);
const overridePath = path.resolve(
    __dirname,
    '..',
    'public/database/override.json'
);

async function collectDataFiles(dir: string) {
    const files = await readdir(dir, { recursive: true });
    return files.flatMap((file) =>
        file.endsWith('.json') ? [path.join(dir, file)] : []
    );
}

function applyColourCompat(item: DatabaseItem): DatabaseItem {
    if (item.colour) {
        item.colours = [item.colour];
        delete item.colour;
    }
    return item;
}

async function loadLegacyDatabaseItems(
    databaseItemsDir: string
): Promise<DatabaseItem[]> {
    const filePaths = await collectDataFiles(
        path.resolve(__dirname, '..', databaseItemsDir)
    );
    const databaseItems = (
        await Promise.all(
            filePaths.map(async (filePath) => {
                const items = JSON.parse(
                    await readFile(filePath, 'utf8')
                ) as DatabaseItem[];
                return items.map(applyColourCompat);
            })
        )
    ).flat();
    return databaseItems;
}

async function loadOverriddenDatabaseItems(): Promise<DatabaseItem[]> {
    const automatedItems = JSON.parse(
        await readFile(automatedDatabasePath, 'utf8')
    ) as DatabaseItem[];
    const overrideItems = JSON.parse(
        await readFile(overridePath, 'utf8')
    ) as Partial<DatabaseItem>[];

    const itemsById = new Map(automatedItems.map((item) => [item.id, item]));

    for (const override of overrideItems) {
        if (override.id === undefined) {
            throw new Error(
                `Override item is missing an id: ${JSON.stringify(override)}`
            );
        }
        itemsById.set(override.id, {
            ...itemsById.get(override.id),
            ...override,
        } as DatabaseItem);
    }

    return Array.from(itemsById.values()).map(applyColourCompat);
}

async function validateDatabaseItems(
    databaseItems: DatabaseItem[]
): Promise<void> {
    const allErrors: string[] = [];
    for (const item of databaseItems) {
        allErrors.push(
            ...(await validateDatabaseItem(
                'automated-database.json + override.json',
                item
            ))
        );
    }

    if (allErrors.length > 0) {
        console.error(
            `Database validation for ${databaseItems.length} item(s) failed with ${allErrors.length} error(s):\n`
        );
        for (const error of allErrors) {
            console.error(`- ${error}`);
        }
        process.exit(1);
    }
    console.log(
        `Database validation passed for ${databaseItems.length} item(s).`
    );
}

async function compressDatabase() {
    const rawArgs = process.argv.slice(2);
    const withOverride = rawArgs.includes('--with-override');
    const positionalArgs = rawArgs.filter((arg) => !arg.startsWith('--'));

    const databaseItemsDirRaw = positionalArgs[0];
    const databaseItemsDir =
        databaseItemsDirRaw && !databaseItemsDirRaw.startsWith('$')
            ? databaseItemsDirRaw
            : (process.env.npm_package_config_databaseItemsDir ??
              'public/items');

    const exportDirRaw = positionalArgs[1];
    const exportDir =
        exportDirRaw && !exportDirRaw.startsWith('$')
            ? exportDirRaw
            : (process.env.npm_package_config_exportDir ?? 'app/data/');

    if (!databaseItemsDir || !exportDir) {
        console.error('Error: databaseItemsDir or exportDir not specified.');
        process.exit(1);
    }

    const databaseItems = withOverride
        ? await loadOverriddenDatabaseItems()
        : await loadLegacyDatabaseItems(databaseItemsDir);

    if (withOverride) {
        await validateDatabaseItems(databaseItems);
    }

    await mkdir(path.resolve(__dirname, '..', exportDir), {
        recursive: true,
    });
    await writeFile(
        path.join(path.resolve(__dirname, '..', exportDir), 'database.json'),
        JSON.stringify(databaseItems)
    );
    console.log('database.json written.');
}

compressDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
});
