/**
 * Download the shop catalogues and prices from LootLocker, the backend of the
 * game. The game files know the key of every catalogue, so nothing has to be
 * visited in-game.
 *
 * Usage:
 *   npm run database:fetch
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { CatalogueExport } from './catalogues';
import { readCatalogues } from './game-data';
import { cataloguesDir } from './paths';

const root = path.resolve(__dirname, '..', '..');
const api = 'https://api.lootlocker.com';
const perPage = Number(process.env.LOOTLOCKER_PER_PAGE) || 40;
const requestPause = 500;
const maxAttempts = 6;

/**
 * Shops that can't be visited in-game. Their catalogues are left out so they
 * don't end up in the database.
 */
const excludedShops = [/^DA_Shop_.*Test\d*$/, /^DA_Shop_Stylist/];

function exitWithError(message: string): never {
    console.error(`Error: ${message}`);
    process.exit(1);
}

/**
 * Read the session token the game stores on every login. It is the `Token`
 * property of the most recent `LootLocker_pd_<player>.sav`.
 * @returns The token or `undefined` if the game never logged in on this computer.
 */
function readTokenOfGame(): string | undefined {
    const savesDir = path.join(
        process.env.LOCALAPPDATA ?? '',
        'ThunderHorse/Saved/SaveGames'
    );
    if (!existsSync(savesDir)) return undefined;

    const [save] = readdirSync(savesDir)
        .filter((file) => /^LootLocker_pd_.+\.sav$/.test(file))
        .map((file) => path.join(savesDir, file))
        .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
    if (!save) return undefined;

    return readFileSync(save, 'latin1').match(
        /Token\0[\s\S]{0,64}?StrProperty\0[\s\S]{0,32}?([\x21-\x7e]{16,})\0/
    )?.[1];
}

function readToken(): string {
    const envPath = path.join(root, '.env');
    if (existsSync(envPath)) process.loadEnvFile(envPath);

    const token =
        process.env.LOOTLOCKER_SESSION_TOKEN?.trim() || readTokenOfGame();
    if (!token) {
        exitWithError(
            "Couldn't find the session token of the game. Launch Equinox: Homecoming and log in, see how-to-update.md."
        );
    }
    return token;
}

async function fetchPage(
    key: string,
    cursor: string | null,
    token: string
): Promise<CatalogueExport | null> {
    const url = new URL(
        `${api}/game/catalog/key/${encodeURIComponent(key)}/prices`
    );
    url.searchParams.set('per_page', String(perPage));
    if (cursor) url.searchParams.set('cursor', cursor);

    let response: Response;
    for (let attempt = 1; ; attempt++) {
        // LootLocker limits how quickly a player may send requests and
        // occasionally fails to answer.
        await setTimeout(requestPause);
        response = await fetch(url, {
            headers: { 'x-session-token': token, 'LL-Version': '2021-03-01' },
        });
        const retry = response.status === 429 || response.status >= 500;
        if (!retry || attempt === maxAttempts) break;

        const retryAfter = Number(response.headers.get('retry-after'));
        await setTimeout((retryAfter || 5 * attempt) * 1000);
    }

    if (response.status === 404) return null;
    if (response.status === 401 || response.status === 403) {
        exitWithError(
            `LootLocker rejected the session token (${response.status}). Launch Equinox: Homecoming, log in, and run this again while the game is running.`
        );
    }
    if (!response.ok) {
        exitWithError(
            `LootLocker answered ${key} with ${response.status}: ${(await response.text()).slice(0, 300)}`
        );
    }
    return (await response.json()) as CatalogueExport;
}

/**
 * Download a catalogue with all of its pages merged into one.
 * @returns The catalogue or `null` if LootLocker doesn't know it.
 */
async function fetchCatalogue(
    key: string,
    token: string
): Promise<CatalogueExport | null> {
    const catalogue = await fetchPage(key, null, token);
    if (!catalogue) return null;

    let cursor = catalogue.pagination.next_cursor;
    while (cursor && catalogue.entries.length < catalogue.pagination.total) {
        const page = await fetchPage(key, cursor, token);
        if (!page || page.entries.length === 0) break;
        catalogue.entries.push(...page.entries);
        catalogue.assets_details = [
            ...(catalogue.assets_details ?? []),
            ...(page.assets_details ?? []),
        ];
        cursor = page.pagination.next_cursor;
    }

    if (catalogue.entries.length < catalogue.pagination.total) {
        exitWithError(
            `Only received ${catalogue.entries.length} of the ${catalogue.pagination.total} entries of ${key}.`
        );
    }
    catalogue.pagination.next_cursor = null;
    return catalogue;
}

async function fetchCatalogues() {
    const token = readToken();

    const keys = new Set<string>();
    const excluded: string[] = [];
    for (const [shop, shopKeys] of readCatalogues().shops) {
        if (excludedShops.some((pattern) => pattern.test(shop))) {
            excluded.push(shop);
            continue;
        }
        shopKeys.forEach((key) => keys.add(key));
    }

    const written = new Set<string>();
    const unknown: string[] = [];
    await mkdir(cataloguesDir, { recursive: true });

    for (const key of [...keys].sort()) {
        const catalogue = await fetchCatalogue(key, token);
        if (!catalogue) {
            unknown.push(key);
            continue;
        }
        const file = `${key}.json`;
        await writeFile(
            path.join(cataloguesDir, file),
            JSON.stringify(catalogue, null, 4) + '\n'
        );
        written.add(file);
    }

    if (written.size === 0) {
        exitWithError('LootLocker does not know any catalogue of the game.');
    }

    // Everything in the directory is replaced, so a catalogue the game dropped
    // or an older manual export can't linger.
    for (const file of await readdir(cataloguesDir)) {
        if (file.endsWith('.json') && !written.has(file)) {
            await rm(path.join(cataloguesDir, file));
        }
    }

    console.log(
        `Downloaded ${written.size} catalogue(s) to ${path.relative(root, cataloguesDir)}.`
    );
    if (unknown.length > 0) {
        console.log(
            `LootLocker doesn't know ${unknown.length} catalogue(s) of the game files: ${unknown.join(', ')}`
        );
    }
    if (excluded.length > 0) {
        console.log(
            `Left out the shops that can't be visited in-game: ${excluded.join(', ')}`
        );
    }
}

fetchCatalogues().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
