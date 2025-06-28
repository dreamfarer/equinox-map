import * as fs from 'fs';
import * as path from 'path';

function exitWithError(message: string): void {
  console.error(`Error: ${message}`);
  process.exit(1);
}

interface Arguments {
  filePath: string;
  xOffset: number;
  yOffset: number;
}

/** Parse CLI arguments. */
function parseArguments(): Arguments {
  const [, , jsonFilePathArg, xOffsetArg, yOffsetArg] = process.argv;
  if (!jsonFilePathArg || !xOffsetArg || !yOffsetArg) {
    exitWithError(
      'Usage: npm run build:move -- <file.json> -- <x-Offset> <y-Offset>'
    );
  }
  const filePath = path.resolve(jsonFilePathArg);
  const xOffset = parseFloat(xOffsetArg);
  const yOffset = parseFloat(yOffsetArg);
  if (isNaN(xOffset) || isNaN(yOffset)) {
    exitWithError('x-Offset and y-Offset must be valid numbers.');
  }
  return { filePath, xOffset, yOffset };
}

/** Get JSON data from the specified file. */
function getData(filePath: string): any {
  let data: any;
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(fileContent);
  } catch (err) {
    exitWithError(
      `Failed to read or parse the file: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  if (!Array.isArray(data)) {
    exitWithError('Expected a JSON array at the root of the file.');
  }
  return data;
}

/** Orchestrate, move and write output. */
function move() {
  let movedCount = 0;
  const { filePath, xOffset, yOffset } = parseArguments();
  const data = getData(filePath);
  const updated = data.map((entry: any) => {
    if (typeof entry.x === 'number' && typeof entry.y === 'number') {
      entry.x += xOffset;
      entry.y += yOffset;
      movedCount++;
    }
    return entry;
  });

  try {
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
    console.log(`Moved ${movedCount} entries in ${filePath}`);
  } catch (err) {
    exitWithError(
      `Failed to write the updated file: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

move();
