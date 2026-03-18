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
): Promise<string[]> {
    const errors: string[] = [];
    const itemLabel = item.id || item.name || '<unknown item>';

    if (!item.id)
        errors.push(
            `Missing id for ${item.name ?? '<unknown>'} in ${filePath}`
        );
    if (!item.name) errors.push(`Missing name for ${itemLabel} in ${filePath}`);
    if (!item.type) errors.push(`Missing type for ${itemLabel} in ${filePath}`);

    if (xor('statsAmount' in item, 'statsType' in item)) {
        errors.push(
            `Missing statsAmount or statsType for ${itemLabel} in ${filePath}`
        );
    }

    if ('statsAmount' in item && item.statsAmount === 0) {
        errors.push(
            `Invalid statsAmount for ${itemLabel} in ${filePath}: ${item.statsAmount}`
        );
    }

    if (item.statsType && !allowedStatsTypes.includes(item.statsType)) {
        errors.push(
            `Invalid statsType for ${itemLabel} in ${filePath}: ${item.statsType}`
        );
    }

    if (xor('level' in item, 'faction' in item)) {
        errors.push(`Missing level or faction for ${itemLabel} in ${filePath}`);
    }

    if ('level' in item && item.level !== undefined) {
        if (item.level < 1 || item.level > 10) {
            errors.push(
                `Invalid level for ${itemLabel} in ${filePath}: ${item.level}`
            );
        }
    }

    if (item.faction && !allowedFaction.includes(item.faction)) {
        errors.push(
            `Invalid faction for ${itemLabel} in ${filePath}: ${item.faction}`
        );
    }

    if (xor('cost' in item, 'currency' in item)) {
        errors.push(`Missing cost or currency for ${itemLabel} in ${filePath}`);
    }

    if ('cost' in item && item.cost !== undefined) {
        if (item.cost < 0) {
            errors.push(
                `Invalid cost for ${itemLabel} in ${filePath}: ${item.cost}`
            );
        }
    }

    if (item.currency && !allowedCurrencies.includes(item.currency)) {
        errors.push(
            `Invalid currency for ${itemLabel} in ${filePath}: ${item.currency}`
        );
    }

    if (item.shop && !allowedShop.includes(item.shop)) {
        errors.push(
            `Invalid shop for ${itemLabel} in ${filePath}: ${item.shop}`
        );
    }

    if (xor('upgradeAmount' in item, 'upgradeItem' in item)) {
        errors.push(
            `Missing upgradeAmount or upgradeItem for ${itemLabel} in ${filePath}`
        );
    }

    if ('upgradeAmount' in item && item.upgradeAmount !== undefined) {
        if (item.upgradeAmount < 0) {
            errors.push(
                `Invalid upgradeAmount for ${itemLabel} in ${filePath}: ${item.upgradeAmount}`
            );
        }
    }

    if (item.upgradeItem && !allowedItems.includes(item.upgradeItem)) {
        errors.push(
            `Invalid upgradeItem for ${itemLabel} in ${filePath}: ${item.upgradeItem}`
        );
    }

    if (item.imagePath) {
        try {
            await access(
                path.join(path.resolve(__dirname, '../public/'), item.imagePath)
            );
        } catch {
            errors.push(`Missing image for ${itemLabel} in ${filePath}`);
        }
    }

    return errors;
}

async function collectDataFiles(dir: string) {
    const files = await readdir(dir, { recursive: true });
    return files.flatMap((file) =>
        file.endsWith('.json') ? [path.join(dir, file)] : []
    );
}

async function validateDatabase() {
    const allErrors: string[] = [];
    const [, , databaseItemsDir] = process.argv;
    const filePaths = await collectDataFiles(
        path.resolve(__dirname, '../' + databaseItemsDir)
    );

    for (const filePath of filePaths) {
        let file: DatabaseItem[];

        try {
            file = JSON.parse(await readFile(filePath, 'utf8'));
        } catch (err) {
            allErrors.push(
                `Failed to parse JSON in ${filePath}: ${
                    err instanceof Error ? err.message : String(err)
                }`
            );
            continue;
        }

        for (const item of file) {
            const itemErrors = await validateDatabaseItem(filePath, item);
            allErrors.push(...itemErrors);
        }
    }

    if (allErrors.length > 0) {
        console.error(
            `Database validation failed with ${allErrors.length} error(s):\n`
        );
        for (const error of allErrors) {
            console.error(`- ${error}`);
        }
        process.exit(1);
    }
    console.log('Database validation passed.');
}

validateDatabase().catch((err) => {
    console.error('Unexpected validation failure:', err);
    process.exit(1);
});
