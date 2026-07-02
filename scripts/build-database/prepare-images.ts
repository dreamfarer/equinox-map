import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const outputDir = path.join('public', 'icon', '256');

/**
 * Copy every referenced fmodel icon (keyed by output file name, valued by
 * source PNG path) into `public/icon/256/`, convert the whole batch to
 * cropped 256px webp via the existing `build:prepare` script, then discard
 * the intermediate PNGs.
 */
export async function prepareImages(imageSources: Map<string, string>) {
    if (imageSources.size === 0) return;

    await mkdir(outputDir, { recursive: true });
    const copiedFiles: string[] = [];
    const missing: string[] = [];

    for (const [fileName, sourcePath] of imageSources) {
        const destPath = path.join(outputDir, `${fileName}.png`);
        try {
            await copyFile(sourcePath, destPath);
            copiedFiles.push(destPath);
        } catch {
            missing.push(sourcePath);
        }
    }

    if (missing.length > 0) {
        console.warn(
            `No source image found for ${missing.length} icon(s):`,
            missing
        );
    }

    if (copiedFiles.length === 0) return;

    execFileSync(
        'npm',
        [
            'run',
            'build:prepare',
            '--',
            `${outputDir}${path.sep}`,
            '80',
            'auto',
            'auto',
            '256',
        ],
        { stdio: 'inherit', shell: true }
    );

    for (const file of copiedFiles) {
        await rm(file);
    }
}
