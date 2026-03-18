import path from 'node:path';
import { DatabaseItem } from '@/types/database-item';
import { access, readdir, readFile } from 'node:fs/promises';

const allowedItems = [
    'Dandelions',
    'Deer Antlers',
    'Apples',
    'Blackberries',
    'Wild Carrots',
    'Delphinium',
    "Dryad's Saddle Mushrooms",
    'Eagle Feathers',
    'Fossils',
    'Old Horseshoes',
    'King Boletus Mushrooms',
    'Moss',
    'Poppies',
    'Raspberries',
    'Raven Feathers',
    'Seagull Feathers',
    'Sulfur Shelf Mushrooms',
    'Sunflowers',
    'Violets',
    'Water Lilies',
    'Activity Tokens',
];
const allowedShop = [
    "March's Tack Shop (Wendy)",
    "Kathy's Shop",
    "Samuel's Shop",
    "Thomas' Shop",
    "Robert's Shop",
    "Danny's Token Trade",
];
const allowedFaction = [
    'Alderwood Downtown',
    'Alderwood Farms',
    'Alderwood Wilds',
    'Alderwood Equestrians',
    "Hook's End",
];
const allowedCurrencies = ['Silver Sols', 'Activity Tokens', 'Gold Alders'];
const allowedStatsTypes = [
    'Speed',
    'Agility',
    'Strength',
    'Endurance',
    'Jumping',
    'Riding',
    'Fitness',
    'Control',
];

function xor(a: boolean, b: boolean): boolean {
    return (a && !b) || (!a && b);
}

export async function validateDatabaseItem(
    filePath: string,
    item: DatabaseItem
) {
    if (!item.id) throw new Error(`Missing id for ${item.name} in ${filePath}`);
    if (!item.name)
        throw new Error(`Missing name for ${item.id} in ${filePath}`);
    if (!item.type)
        throw new Error(`Missing type for ${item.id} in ${filePath}`);
    if (xor('statsAmount' in item, 'statsType' in item))
        throw new Error(
            `Missing statsAmount or statsType for ${item.id} in ${filePath}`
        );
    if (item.statsAmount) {
        if (item.statsAmount == 0) {
            throw new Error(
                `Invalid statsAmount for ${item.id} in ${filePath}: ${item.statsAmount}`
            );
        }
    }
    if (item.statsType) {
        if (!allowedStatsTypes.includes(item.statsType)) {
            throw new Error(
                `Invalid statsType for ${item.id} in ${filePath}: ${item.statsType}`
            );
        }
    }
    if (xor('level' in item, 'faction' in item))
        throw new Error(
            `Missing level or faction for ${item.id} in ${filePath}`
        );
    if (item.level) {
        if (item.level < 1 || item.level > 10) {
            throw new Error(
                `Invalid level for ${item.id} in ${filePath}: ${item.level}`
            );
        }
    }
    if (item.faction) {
        if (!allowedFaction.includes(item.faction)) {
            throw new Error(
                `Invalid faction for ${item.id} in ${filePath}: ${item.faction}`
            );
        }
    }
    if (xor('cost' in item, 'currency' in item)) {
        throw new Error(
            `Missing cost or currency for ${item.id} in ${filePath}`
        );
    }
    if (item.cost) {
        if (item.cost < 0) {
            throw new Error(
                `Invalid cost for ${item.id} in ${filePath}: ${item.cost}`
            );
        }
    }
    if (item.currency) {
        if (!allowedCurrencies.includes(item.currency)) {
            throw new Error(
                `Invalid currency for ${item.id} in ${filePath}: ${item.currency}`
            );
        }
    }
    if (item.shop) {
        if (!allowedShop.includes(item.shop)) {
            throw new Error(
                `Invalid shop for ${item.id} in ${filePath}: ${item.shop}`
            );
        }
    }
    if (xor('upgradeAmount' in item, 'upgradeItem' in item)) {
        throw new Error(
            `Missing upgradeAmount or upgradeItem for ${item.id} in ${filePath}`
        );
    }
    if (item.upgradeAmount) {
        if (item.upgradeAmount < 0) {
            throw new Error(
                `Invalid upgradeAmount for ${item.id} in ${filePath}: ${item.upgradeAmount}`
            );
        }
    }
    if (item.upgradeItem) {
        if (!allowedItems.includes(item.upgradeItem)) {
            throw new Error(
                `Invalid upgradeItem for ${item.id} in ${filePath}: ${item.upgradeItem}`
            );
        }
    }
    if (item.imagePath) {
        try {
            await access(
                path.join(path.resolve(__dirname, '../public/'), item.imagePath)
            );
        } catch {
            throw new Error(`Missing image for ${item.id} in ${filePath}`);
        }
    }
}

async function collectDataFiles(dir: string) {
    const files = await readdir(dir, { recursive: true });
    return files.flatMap((file) =>
        file.endsWith('.json') ? [path.join(dir, file)] : []
    );
}

async function validateDatabase() {
    const [, , databaseItemsDir] = process.argv;
    const filePaths = await collectDataFiles(
        path.resolve(__dirname, '../' + databaseItemsDir)
    );
    for (const filePath of filePaths) {
        const file: DatabaseItem[] = JSON.parse(
            await readFile(filePath, 'utf8')
        );
        for (const item of file) {
            await validateDatabaseItem(filePath, item);
        }
    }
}

validateDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
});
