import path from 'node:path';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { DatabaseItem } from '@/types/database-item';

async function collectDataFiles(dir: string) {
    const files = await readdir(dir, { recursive: true });
    return files.flatMap((file) =>
        file.endsWith('.json') ? [path.join(dir, file)] : []
    );
}

async function compressDatabase() {
    const databaseItemsDirRaw = process.argv[2];
    const databaseItemsDir =
        databaseItemsDirRaw && !databaseItemsDirRaw.startsWith('$')
            ? databaseItemsDirRaw
            : (process.env.npm_package_config_databaseItemsDir ??
              'public/test-items');

    const exportDirRaw = process.argv[3];
    const exportDir =
        exportDirRaw && !exportDirRaw.startsWith('$')
            ? exportDirRaw
            : (process.env.npm_package_config_exportDir ?? 'app/data/');

    if (!databaseItemsDir || !exportDir) {
        console.error('Error: databaseItemsDir or exportDir not specified.');
        process.exit(1);
    }

    const filePaths = await collectDataFiles(
        path.resolve(__dirname, '..', databaseItemsDir)
    );
    const databaseItems = (
        await Promise.all(
            filePaths.map(
                async (filePath) =>
                    JSON.parse(
                        await readFile(filePath, 'utf8')
                    ) as DatabaseItem[]
            )
        )
    ).flat();
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
