import { readdir } from 'node:fs/promises';
import path from 'node:path';

export async function getFilePaths(dir: string): Promise<string[]> {
    return (await readdir(dir, { recursive: true })).map((file) =>
        path.join(dir, file)
    );
}
