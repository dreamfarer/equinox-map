import { existsSync } from 'node:fs';
import { mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { processImage } from '../prepare-icons';
import { iconsDir, publicDir } from './paths';

const quality = 80;
const size = 256;

/**
 * Convert the exported textures to the icons the database displays and remove
 * icons that are no longer in use.
 * @param texturePaths - The paths of the exported textures.
 * @returns The image path of each texture, missing textures are left out.
 */
export async function prepareIcons(
    texturePaths: Set<string>
): Promise<Map<string, string>> {
    const sources = new Map<string, string>();
    const imagePaths = new Map<string, string>();
    const missing: string[] = [];

    await mkdir(iconsDir, { recursive: true });

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
        await processImage(texturePath, outPath, quality, 'auto', 'auto', size);
        if (!existsSync(outPath)) {
            throw new Error(`${texturePath} couldn't be converted.`);
        }

        sources.set(fileName, texturePath);
        imagePaths.set(
            texturePath,
            `/${path.relative(publicDir, outPath).split(path.sep).join('/')}`
        );
    }

    for (const file of await readdir(iconsDir)) {
        if (!sources.has(file)) await rm(path.join(iconsDir, file));
    }

    if (missing.length > 0) {
        console.warn(
            `${missing.length} texture(s) are missing in the FModel export, their items won't have an icon:\n${missing.map((file) => `- ${path.relative(process.cwd(), file)}`).join('\n')}`
        );
    }

    return imagePaths;
}
