import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { DatabaseItem } from '@/types/database-item';
import { parseFiddlerExport } from './parse-fiddler-export';
import { matchFmodelExport } from './match-fmodel-export';

const outputDir = path.resolve(__dirname, '..', '..', 'public/database');

async function buildDatabase(): Promise<DatabaseItem[]> {
    const fiddlerExportParsed = await parseFiddlerExport();
    const matched = await matchFmodelExport(fiddlerExportParsed);

    return Object.entries(matched).map(
        ([id, entry]) => ({ ...entry, id: Number(id) }) as DatabaseItem
    );
}

async function main() {
    const database = await buildDatabase();

    await mkdir(outputDir, { recursive: true });
    await writeFile(
        path.join(outputDir, 'automated-database.json'),
        JSON.stringify(database)
    );
    console.log(
        `automated-database.json written with ${database.length} item(s).`
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
