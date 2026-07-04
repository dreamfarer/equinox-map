import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { DatabaseItem } from '@/types/database-item';
import { buildServerData } from './build-server-data';
import { matchToLocalDataExport } from './match-to-local-data-export';

const outputDir = path.resolve(__dirname, '..', '..', 'public/database');
const outputPath = path.join(outputDir, 'automated-database.json');

/**
 * Build the database by parsing the Fiddler export (server data) and matching it to the FModel export (local data).
 * @returns The database items.
 */
async function buildDatabase(): Promise<DatabaseItem[]> {
    const automatedDatabaseItems = await buildServerData();
    await matchToLocalDataExport(automatedDatabaseItems);

    return Object.entries(automatedDatabaseItems).map(
        ([id, entry]) => ({ ...entry, id: Number(id) }) as DatabaseItem
    );
}

/**
 * Build and write the database.
 */
async function main() {
    const database = await buildDatabase();

    await mkdir(outputDir, { recursive: true });
    await writeFile(outputPath, JSON.stringify(database, null, 4));
    console.log(
        `Automated database written with ${database.length} item(s) written to ${outputPath}.`
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
