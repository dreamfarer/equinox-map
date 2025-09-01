/**
 * Usage:
 *   npm run build:prepare -- <img> <quality> <cropX> <cropY> <size>
 * Example:
 *   npm run build:prepare -- <img> 80 15 15 64 (used in this project)
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

function exitWithError(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

interface Arguments {
  filePath: string;
  quality: number;
  cropX: number;
  cropY: number;
  size: number;
}

/** Parse CLI arguments. */
function parseArguments(): Arguments {
  const [, , imgPathArg, qualityArg, cropXArg, cropYArg, sizeArg] =
    process.argv;

  if (!imgPathArg || !qualityArg || !cropXArg || !cropYArg || !sizeArg) {
    exitWithError(
      'Usage: npm run build:convert -- <img> <quality> <cropX> <cropY> <size>'
    );
  }

  const filePath = path.resolve(imgPathArg);
  const quality = Number(qualityArg);
  const cropX = Number(cropXArg);
  const cropY = Number(cropYArg);
  const size = Number(sizeArg);

  if ([quality, cropX, cropY, size].some((n) => isNaN(n) || n < 0)) {
    exitWithError(
      'quality, cropX, cropY and size must be non-negative numbers.'
    );
  }
  if (quality >= 100) {
    exitWithError('quality must be between 0 and 100.');
  }
  if (!fs.existsSync(filePath)) {
    exitWithError(`File not found: ${filePath}`);
  }

  return { filePath, quality, cropX, cropY, size };
}

/** Orchestrate, crop, resize and export to WebP. */
async function convert(): Promise<void> {
  const { filePath, quality, cropX, cropY, size } = parseArguments();

  let meta;
  try {
    meta = await sharp(filePath).metadata();
  } catch (err) {
    exitWithError(
      `Unable to read image metadata: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  const { width, height } = meta;
  if (typeof width !== 'number' || typeof height !== 'number') {
    exitWithError('Could not determine image dimensions.');
  }

  const cropWidth = width - 2 * cropX;
  const cropHeight = height - 2 * cropY;

  if (cropWidth <= 0 || cropHeight <= 0) {
    exitWithError(
      `Crop too large. Image is ${width}×${height}, but you tried to remove ${cropX}px horizontal and ${cropY}px vertical from each side.`
    );
  }

  const { dir, name } = path.parse(filePath);
  const outPath = path.join(dir, `${name}.webp`);

  try {
    await sharp(filePath)
      .extract({
        left: cropX,
        top: cropY,
        width: cropWidth,
        height: cropHeight,
      })
      .resize(size, size, { fit: 'cover' })
      .webp({ quality })
      .toFile(outPath);
    console.log(`Wrote ${outPath}`);
  } catch (err) {
    exitWithError(
      `Failed to process image: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

convert();
