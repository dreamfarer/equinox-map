import path from 'node:path';
import { readdir } from 'node:fs/promises';

const itemsDir = path.resolve(__dirname, '../public/items');

async function getDataFiles() {
    const files = await readdir(itemsDir, { recursive: true });
    return files.flatMap((file) =>
        file.endsWith('.json') ? [path.join(itemsDir, file)] : []
    );
}

async function compressDatabase() {
    const files = await getDataFiles();
    for (const file of files) console.log(file);
}

compressDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
});