import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DatabaseItem } from '../../types/database-item';
import { databasePath } from './paths';
import { collectListings, placeholderColour, readSources } from './sources';

/**
 * The game doesn't store these amounts per item: every item with stats
 * provides the same amount and costs the same to upgrade.
 */
const statsAmount = 40;
const upgradeAmount = 10;

/**
 * Build the database the app displays from the imported items and the
 * information maintained by hand.
 */
async function buildDatabase() {
    const { items, colours, extras } = await readSources();

    const database = items.map((item): DatabaseItem => {
        const listings = collectListings(item, extras);
        const available = listings.some((listing) => listing.available);
        const itemColours = (colours[item.id] ?? []).filter(
            (colour) => colour !== placeholderColour
        );

        return {
            id: item.id,
            name: item.name,
            type: item.type,
            ...(item.statsType
                ? { statsAmount, statsType: item.statsType }
                : {}),
            ...(item.upgradeItem
                ? { upgradeAmount, upgradeItem: item.upgradeItem }
                : {}),
            ...(itemColours.length > 0 ? { colours: itemColours } : {}),
            ...(item.imagePath ? { imagePath: item.imagePath } : {}),
            // A listing that is no longer offered is only of interest if
            // there is no other way to obtain the item.
            listings: listings
                .filter((listing) => listing.available === available)
                .map(({ shop, faction, level, bundle, cost, currency }) => ({
                    shop,
                    faction,
                    level,
                    bundle,
                    cost,
                    currency,
                })),
            available,
        };
    });

    await mkdir(path.dirname(databasePath), { recursive: true });
    await writeFile(databasePath, JSON.stringify(database));
    console.log(`database.json written with ${database.length} item(s).`);
}

buildDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
});
