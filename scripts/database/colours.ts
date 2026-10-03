import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import * as prettier from 'prettier';
import { coloursPath } from './paths';
import { placeholderColour } from './sources';
import { Colours } from './types';

export const placeholderColours = [placeholderColour];

const collator = new Intl.Collator('en', { numeric: true });

/**
 * Add the items that don't have colours yet to `colours.json` with a
 * placeholder and sort the file by item ID, so that every item has its place
 * and only the colours need to be filled in.
 * @param ids - The IDs of all items.
 * @returns The IDs of the items that were added with the placeholder.
 */
export async function addMissingColours(ids: string[]): Promise<string[]> {
    const colours: Colours = existsSync(coloursPath)
        ? JSON.parse(await readFile(coloursPath, 'utf8'))
        : {};

    const added = ids.filter((id) => !(id in colours));
    for (const id of added) colours[id] = placeholderColours;

    const sorted = Object.fromEntries(
        Object.entries(colours).sort(([a], [b]) => collator.compare(a, b))
    );
    await writeFile(
        coloursPath,
        await prettier.format(JSON.stringify(sorted), {
            ...(await prettier.resolveConfig(coloursPath)),
            filepath: coloursPath,
        })
    );

    return added;
}
