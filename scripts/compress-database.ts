import path from 'node:path';
import { readdir, readFile, writeFile } from 'node:fs/promises';

type DatabaseItemSource = {
    name: string;
    category: string;
    statsAmount?: number;
    statsType?: string;
    level?: number;
    faction?: string;
    cost?: number;
    currency?: string;
    shop?: string;
    upgradeAmount?: number;
    upgradeItem?: string;
    imagePath: string;
};

type DatabaseItem = {
    a: string; // name
    b: number; // category
    c?: number; // stats amount
    d?: number; // stats type
    e?: number; // level
    f?: number; // faction
    g?: number; // cost
    h?: number; // currency
    i?: number; // shop
    j?: number; // upgrade amount
    k?: number; // upgrade item
    l: string; // image path
};

type Mapping = {
    b: string[];
    d: string[];
    f: string[];
    h: string[];
    i: string[];
    k: string[];
};

const itemsDir = path.resolve(__dirname, '../public/items-test');
const dataDir = path.resolve(__dirname, '../app/data');

async function getDataFiles() {
    const files = await readdir(itemsDir, { recursive: true });
    return files.flatMap((file) =>
        file.endsWith('.json') ? [path.join(itemsDir, file)] : []
    );
}

function getIndex(mappingField: string[], value: string | undefined) {
    if (!value) return undefined;
    const index = mappingField.indexOf(value);
    if (index !== -1) return index;
    mappingField.push(value);
    return mappingField.length - 1;
}

function getIndexStrict(mappingField: string[], value: string) {
    const index = getIndex(mappingField, value);
    if (index === undefined) {
        throw new Error(`Value "${value}" not found in mapping.`);
    }
    return index;
}

async function compressDatabase() {
    const databaseItems: DatabaseItem[] = [];
    const mapping: Mapping = {
        b: [],
        d: [],
        f: [],
        h: [],
        i: [],
        k: [],
    };

    const files = await getDataFiles();
    for (const file of files) {
        const data: DatabaseItemSource[] = JSON.parse(
            await readFile(file, 'utf8')
        );
        for (const item of data) {
            databaseItems.push({
                a: item.name,
                b: getIndexStrict(mapping.b, item.category),
                c: item.statsAmount,
                d: getIndex(mapping.d, item.statsType),
                e: item.level,
                f: getIndex(mapping.f, item.faction),
                g: item.cost,
                h: getIndex(mapping.h, item.currency),
                i: getIndex(mapping.i, item.shop),
                j: item.upgradeAmount,
                k: getIndex(mapping.k, item.upgradeItem),
                l: item.imagePath,
            });
        }
    }

    await writeFile(
        path.join(dataDir, 'database.json'),
        JSON.stringify(databaseItems)
    );
    await writeFile(
        path.join(dataDir, 'mapping.json'),
        JSON.stringify(mapping)
    );

    console.log('database.json and mapping.json written.');
}

compressDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
});
