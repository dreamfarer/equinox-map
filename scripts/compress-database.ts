import path from 'node:path';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { DatabaseItem } from '@/types/database-item';
import { z } from 'zod';

export const DatabaseItemSchema = z.object({
    name: z.string(),
    id: z.string(),
    category: z.string(),
    statsAmount: z.number().optional(),
    statsType: z.string().optional(),
    level: z.number().optional(),
    faction: z.string().optional(),
    cost: z.number().optional(),
    currency: z.string().optional(),
    shop: z.string().optional(),
    upgradeAmount: z.number().optional(),
    upgradeItem: z.string().optional(),
    imagePath: z.string(),
});

const itemsDir = path.resolve(__dirname, '../public/items-test');
const exportDir = path.resolve(__dirname, '../public/export');

async function getDataFiles() {
    const files = await readdir(itemsDir, { recursive: true });
    return files.flatMap((file) =>
        file.endsWith('.json') ? [path.join(itemsDir, file)] : []
    );
}

async function compressDatabase() {
    const databaseItems: DatabaseItem[] = [];
    const files = await getDataFiles();
    for (const file of files) {
        const parsed = JSON.parse(await readFile(file, 'utf8'));
        const validatedItems = z.array(DatabaseItemSchema).parse(parsed);
        databaseItems.push(...validatedItems);
    }

    await writeFile(
        path.join(exportDir, 'database.json'),
        JSON.stringify(databaseItems)
    );

    console.log('database.json written.');
}

compressDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
});
