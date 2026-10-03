import { existsSync } from 'node:fs';
import path from 'node:path';
import { colours as knownColours } from '../../schema/database/colours';
import { publicDir } from './paths';
import { collectListings, placeholderColour, readSources } from './sources';
import { Colours, ExtraListing, ImportedItem, ImportedListing } from './types';

function isPlaceholder(itemColours: string[] | undefined): boolean {
    return itemColours?.length === 1 && itemColours[0] === placeholderColour;
}

function validateListing(label: string, listing: ImportedListing): string[] {
    const errors: string[] = [];

    if (!listing.shop) errors.push(`Missing shop for ${label}`);
    if (!listing.currency) errors.push(`Missing currency for ${label}`);
    if (!Number.isFinite(listing.cost) || listing.cost < 0) {
        errors.push(`Invalid cost for ${label}: ${listing.cost}`);
    }
    if ((listing.faction === undefined) !== (listing.level === undefined)) {
        errors.push(`Missing level or faction for ${label}`);
    }
    if (listing.level !== undefined && listing.level < 1) {
        errors.push(`Invalid level for ${label}: ${listing.level}`);
    }

    return errors;
}

function validateItems(
    items: ImportedItem[],
    extras: ExtraListing[]
): string[] {
    const errors: string[] = [];
    const ids = new Set<string>();

    for (const item of items) {
        const label = item.id || item.name || '<unknown item>';

        if (!item.id) errors.push(`Missing id for ${label}`);
        if (!item.name) errors.push(`Missing name for ${label}`);
        if (!item.type) errors.push(`Missing type for ${label}`);
        if (ids.has(item.id)) errors.push(`Duplicate id ${label}`);
        ids.add(item.id);

        if (item.upgradeItem && !item.statsType) {
            errors.push(`Missing statsType for the upgradable ${label}`);
        }
        if (
            item.imagePath &&
            !existsSync(path.join(publicDir, item.imagePath))
        ) {
            errors.push(`Missing image for ${label}: ${item.imagePath}`);
        }

        const listings = collectListings(item, extras);
        if (listings.length === 0) {
            errors.push(
                `No listing for ${label}. Add it to extras.json or run "npm run database:import" again.`
            );
        }
        for (const listing of listings) {
            errors.push(...validateListing(label, listing));
        }
    }

    return errors;
}

function validateExtras(
    items: ImportedItem[],
    extras: ExtraListing[]
): string[] {
    const ids = new Set(items.map((item) => item.id));

    return extras.flatMap((extra) =>
        (extra.items ?? [])
            .filter((id) => !ids.has(id))
            .map(
                (id) =>
                    `Unknown item ${id} in extras.json. Run "npm run database:import" to add it to items.json.`
            )
    );
}

function validateColours(items: ImportedItem[], colours: Colours): string[] {
    const errors: string[] = [];
    const ids = new Set(items.map((item) => item.id));

    for (const [id, itemColours] of Object.entries(colours)) {
        if (!ids.has(id)) {
            errors.push(`Unknown item ${id} in colours.json`);
        }
        // An empty list states that the item deliberately has no colour.
        if (!Array.isArray(itemColours)) {
            errors.push(`Invalid colours for ${id} in colours.json`);
            continue;
        }
        if (isPlaceholder(itemColours)) continue;
        const invalid = itemColours.filter(
            (colour) => !knownColours.includes(colour)
        );
        if (invalid.length > 0) {
            errors.push(`Invalid colours for ${id}: ${invalid.join(', ')}`);
        }
        if (new Set(itemColours).size !== itemColours.length) {
            errors.push(`Duplicate colours for ${id}`);
        }
    }

    return errors;
}

async function validateDatabase() {
    const { items, colours, extras } = await readSources();

    const errors = [
        ...validateItems(items, extras),
        ...validateExtras(items, extras),
        ...validateColours(items, colours),
    ];

    const withoutImage = items.filter((item) => !item.imagePath);
    if (withoutImage.length > 0) {
        console.warn(
            `${withoutImage.length} item(s) without an icon: ${withoutImage.map((item) => item.id).join(', ')}\n`
        );
    }
    const withoutColours = items.filter(
        (item) => !colours[item.id] || isPlaceholder(colours[item.id])
    );
    if (withoutColours.length > 0) {
        console.warn(
            `${withoutColours.length} item(s) without colours in colours.json: ${withoutColours.map((item) => item.id).join(', ')}\n`
        );
    }

    if (errors.length > 0) {
        console.error(
            `Database validation for ${items.length} item(s) failed with ${errors.length} error(s):\n`
        );
        for (const error of errors) {
            console.error(`- ${error}`);
        }
        process.exit(1);
    }
    console.log(`Database validation passed for ${items.length} item(s).`);
}

validateDatabase().catch((err) => {
    console.error('Unexpected validation failure:', err);
    process.exit(1);
});
