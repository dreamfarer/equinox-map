import { parseFiddlerExport } from './parse-fiddler-export';

async function buildDatabase() {
    const fiddlerExportParsed = await parseFiddlerExport();
    console.log(fiddlerExportParsed);
}

buildDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
});
