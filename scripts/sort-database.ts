import path from 'node:path';
import { readFile, writeFile, readdir } from 'node:fs/promises';

async function collectDataFiles(dir: string) {
    const files = await readdir(dir, { recursive: true });
    return files.flatMap((file) =>
        file.endsWith('.json') ? [path.join(dir, file)] : []
    );
}

async function sortDatabase() {
    const databaseItemsDirRaw = process.argv[2];
    const databaseItemsDir =
        databaseItemsDirRaw && !databaseItemsDirRaw.startsWith('$')
            ? databaseItemsDirRaw
            : (process.env.npm_package_config_databaseItemsDir ??
              'public/items');

    if (!databaseItemsDir) {
        console.error('Error: databaseItemsDir not specified.');
        process.exit(1);
    }

    const filePaths = await collectDataFiles(
        path.resolve(__dirname, '..', databaseItemsDir)
    );

    for (const filePath of filePaths) {
        const content = await readFile(filePath, 'utf8');
        const items = JSON.parse(content);

        if (Array.isArray(items)) {
            items.sort((a, b) => {
                const nameA = a.name || '';
                const nameB = b.name || '';
                return nameA.localeCompare(nameB);
            });

            await writeFile(filePath, JSON.stringify(items, null, 4) + '\n');
            console.log(`Sorted ${filePath}`);
        } else {
            console.warn(`Skipping ${filePath} as it is not an array.`);
        }
    }
    console.log('All applicable files sorted.');
}

sortDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
});
