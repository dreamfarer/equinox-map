/**
 * Usage:
 *   npm run build:prepare -- <img> <quality> <cropX|auto> <cropY|auto> <size>
 * Examples:
 *   npm run build:prepare -- ./img.png 80 15 15 64
 *   npm run build:prepare -- ./img.png 80 auto 15 64
 *   npm run build:prepare -- ./img.png 80 auto auto 64
 *   npm run build:prepare -- ./folder/ 80 auto auto 64
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';

function exitWithError(message: string): never {
    console.error(`Error: ${message}`);
    process.exit(1);
}

interface Arguments {
    filePath: string;
    quality: number;
    cropX: number | 'auto';
    cropY: number | 'auto';
    size: number;
}

function parseCropArg(value: string, name: string): number | 'auto' {
    if (value === 'auto') return 'auto';
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) {
        exitWithError(`${name} must be a non-negative number or "auto".`);
    }
    return n;
}

/** Parse CLI arguments. */
function parseArguments(): Arguments {
    const [, , imgPathArg, qualityArg, cropXArg, cropYArg, sizeArg] =
        process.argv;

    if (!imgPathArg || !qualityArg || !cropXArg || !cropYArg || !sizeArg) {
        exitWithError(
            'Usage: npm run build:prepare -- <img> <quality> <cropX|auto> <cropY|auto> <size>'
        );
    }

    const filePath = path.resolve(imgPathArg);
    const quality = Number(qualityArg);
    const cropX = parseCropArg(cropXArg, 'cropX');
    const cropY = parseCropArg(cropYArg, 'cropY');
    const size = Number(sizeArg);

    if ([quality, size].some((n) => Number.isNaN(n) || n < 0)) {
        exitWithError('quality and size must be non-negative numbers.');
    }
    if (quality >= 100) {
        exitWithError('quality must be between 0 and 100.');
    }
    if (!fs.existsSync(filePath)) {
        exitWithError(`File not found: ${filePath}`);
    }

    return { filePath, quality, cropX, cropY, size };
}

async function collectPngFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { recursive: true });
    return entries
        .filter((file) => file.endsWith('.png'))
        .map((file) => path.join(dir, file));
}

async function processImage(
    filePath: string,
    quality: number,
    cropX: number | 'auto',
    cropY: number | 'auto',
    size: number
) {
    const meta = await sharp(filePath).metadata();
    if (!meta.width || !meta.height) return;

    const { info } = await sharp(filePath)
        .trim()
        .toBuffer({ resolveWithObject: true });

    const left = cropX === 'auto' ? Math.abs(info.trimOffsetLeft ?? 0) : cropX;
    const top = cropY === 'auto' ? Math.abs(info.trimOffsetTop ?? 0) : cropY;
    const right =
        cropX === 'auto'
            ? meta.width - (info.width + Math.abs(info.trimOffsetLeft ?? 0))
            : cropX;
    const bottom =
        cropY === 'auto'
            ? meta.height - (info.height + Math.abs(info.trimOffsetTop ?? 0))
            : cropY;
    const extractWidth = meta.width - left - right;
    const extractHeight = meta.height - top - bottom;
    if (extractWidth <= 0 || extractHeight <= 0) return;

    const { dir, name } = path.parse(filePath);
    const outPath = path.join(dir, `${name}.webp`);
    await sharp(filePath)
        .extract({
            left,
            top,
            width: extractWidth,
            height: extractHeight,
        })
        .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .webp({ quality })
        .toFile(outPath);
    console.log(`Wrote ${outPath}`);
}

async function convert(): Promise<void> {
    const { filePath, quality, cropX, cropY, size } = parseArguments();
    const stats = await stat(filePath);
    let files: string[];

    if (stats.isDirectory()) {
        files = await collectPngFiles(filePath);
    } else {
        files = [filePath];
    }

    for (const file of files) {
        try {
            await processImage(file, quality, cropX, cropY, size);
        } catch (err) {
            console.error(`Failed: ${file}`, err);
        }
    }
}

convert().then(() => {});
