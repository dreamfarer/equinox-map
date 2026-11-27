import { existsSync } from 'node:fs';
import {
    copyFile,
    mkdir,
    mkdtemp,
    readdir,
    readFile,
    rm,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { processImage } from '../prepare-icons';
import { iconsDir, publicDir } from './paths';

const quality = 80;
const size = 256;

/**
 * The average difference per colour channel, out of 255, up to which two icons
 * count as the same. Decoding a texture is not exact to the last bit, which
 * the lossy compression turns into a different file for an identical icon.
 */
const tolerance = 2;

async function readPixels(filePath: string) {
    // Reading the file ourselves keeps sharp from locking it on Windows.
    return sharp(await readFile(filePath))
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
}

/**
 * Check whether two icons look the same.
 * @param a - The path of the first icon.
 * @param b - The path of the second icon.
 * @returns Whether their difference is within the tolerance.
 */
async function looksTheSame(a: string, b: string): Promise<boolean> {
    const [first, second] = await Promise.all([readPixels(a), readPixels(b)]);
    if (
        first.info.width !== second.info.width ||
        first.info.height !== second.info.height
    ) {
        return false;
    }

    // The colour of a pixel only matters as far as the pixel is visible.
    let difference = 0;
    for (let i = 0; i < first.data.length; i += 4) {
        const alphaA = first.data[i + 3];
        const alphaB = second.data[i + 3];
        difference += Math.abs(alphaA - alphaB);
        for (let channel = 0; channel < 3; channel++) {
            difference +=
                Math.abs(
                    first.data[i + channel] * alphaA -
                        second.data[i + channel] * alphaB
                ) / 255;
        }
    }
    return difference / first.data.length <= tolerance;
}

/**
 * Convert the exported textures to the icons the database displays and remove
 * icons that are no longer in use.
 * @param texturePaths - The paths of the exported textures.
 * @param keptImagePaths - The image paths of icons to keep although their
 * texture is gone.
 * @returns The image path of each texture, missing textures are left out.
 */
export async function prepareIcons(
    texturePaths: Set<string>,
    keptImagePaths: string[] = []
): Promise<Map<string, string>> {
    const sources = new Map<string, string>();
    const imagePaths = new Map<string, string>();
    const missing: string[] = [];

    await mkdir(iconsDir, { recursive: true });
    const tempDir = await mkdtemp(path.join(tmpdir(), 'icons-'));

    for (const texturePath of [...texturePaths].sort()) {
        const fileName = `${path.parse(texturePath).name}.webp`;
        if (sources.has(fileName)) {
            throw new Error(
                `${texturePath} and ${sources.get(fileName)} would both be written to ${fileName}.`
            );
        }
        if (!existsSync(texturePath)) {
            missing.push(texturePath);
            continue;
        }

        const outPath = path.join(iconsDir, fileName);
        const tempPath = path.join(tempDir, fileName);
        await processImage(
            texturePath,
            tempPath,
            quality,
            'auto',
            'auto',
            size
        );
        if (!existsSync(tempPath)) {
            throw new Error(`${texturePath} couldn't be converted.`);
        }
        // Keep the existing icon if nothing visibly changed, so an update
        // only touches the icons that are new or different.
        if (!existsSync(outPath) || !(await looksTheSame(outPath, tempPath))) {
            await copyFile(tempPath, outPath);
        }

        sources.set(fileName, texturePath);
        imagePaths.set(
            texturePath,
            `/${path.relative(publicDir, outPath).split(path.sep).join('/')}`
        );
    }

    await rm(tempDir, { recursive: true, force: true, maxRetries: 5 });

    const kept = new Set(
        keptImagePaths.map((imagePath) => path.posix.basename(imagePath))
    );
    for (const file of await readdir(iconsDir)) {
        if (!sources.has(file) && !kept.has(file)) {
            await rm(path.join(iconsDir, file));
        }
    }

    if (missing.length > 0) {
        console.warn(
            `${missing.length} texture(s) are missing in the export of the game files, their items won't have an icon:\n${missing.map((file) => `- ${path.relative(process.cwd(), file)}`).join('\n')}`
        );
    }

    return imagePaths;
}
