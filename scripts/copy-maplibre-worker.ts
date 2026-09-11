/**
 * Usage:
 *   npm run build:worker
 *
 * MapLibre GL JS v6 ships as ES modules only and no longer resolves its worker
 * automatically when bundled, so `setWorkerUrl()` has to point at a file we
 * serve ourselves. The worker imports its shared chunk with a relative
 * specifier, so both files have to end up next to each other.
 */

import { copyFile, mkdir } from 'node:fs/promises';
import * as path from 'node:path';

const FILES = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'];
const TARGET_DIR = path.join('public', 'maplibre');

async function main(): Promise<void> {
    const sourceDir = path.join(
        path.dirname(require.resolve('maplibre-gl/package.json')),
        'dist'
    );

    await mkdir(TARGET_DIR, { recursive: true });
    for (const file of FILES) {
        await copyFile(path.join(sourceDir, file), path.join(TARGET_DIR, file));
        console.log(`Copied ${file} to ${TARGET_DIR}`);
    }
}

main().catch((error) => {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
});
