import fs from 'fs';
import path from 'path';

type Marker = {
    x: number;
    y: number;
    map: string;
};
type Markers = Record<string, Marker[]>;

const DATA_DIR = path.resolve(__dirname, 'data'); // input directory of raw Unreal Engine data
const OUTPUT_DIR = path.resolve(__dirname, '../public/markers/resources'); // output directory for the map
const MAP_NAME = 'greenisland'; // map name

/** Convert internal names to more human-readable format. */
const nameOverrides: Record<string, string> = {
    deerantler: 'antlers',
    apple: 'apples',
    blackberriesbush: 'blackberries',
    wildcarrot: 'carrots',
    dandelion: 'dandelions',
    delphinium: 'delphiniums',
    dryadsaddlemushroom: 'dryad-saddle-mushrooms',
    eaglefeather: 'eagle-feathers',
    fossil: 'fossils',
    oldhorseshoe: 'horseshoes',
    kingboletusmushroom: 'king-boletus-mushrooms',
    moss: 'moss',
    poppy: 'poppies',
    raspberriesbush: 'raspberries',
    ravenfeather: 'raven-feathers',
    seagullfeather: 'seagull-feathers',
    sulfurshelfmushroom: 'sulfur-shelf-mushrooms',
    sunflower: 'sunflowers',
    violet: 'violets',
    waterlily: 'water-lilies',
};

/** Collect all file paths recursively from the data directory. */
function getFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const fileInfo = fs.statSync(fullPath);
        if (fileInfo && fileInfo.isDirectory()) {
            results = results.concat(getFiles(fullPath));
        } else if (file.endsWith('.json')) {
            results.push(fullPath);
        }
    });
    return results;
}

/** Go through each file, collect the location and add it to the corresponding dictionary key. */
function extractMarkers(filePath: string): Markers {
    const markers: Markers = {};
    const rawFile = fs.readFileSync(filePath, 'utf-8');

    let json: any;
    try {
        json = JSON.parse(rawFile);
    } catch (e) {
        console.warn(`Invalid JSON in ${filePath}`);
        return markers;
    }

    if (!Array.isArray(json)) return markers;

    for (const obj of json) {
        if (
            obj.Type === 'SceneComponent' &&
            obj.Name === 'DefaultSceneRoot' &&
            obj.Template?.ObjectName &&
            obj.Properties?.RelativeLocation
        ) {
            const objectName = obj.Template.ObjectName;
            const match = objectName.match(
                /BP_CollectableItem_Currency_(.*?)_/
            );
            if (!match) continue;

            let name = match[1].toLowerCase();
            name = nameOverrides[name] ?? name;

            const loc = obj.Properties.RelativeLocation;
            const x = parseFloat((loc.X / -100).toFixed(4));
            const y = parseFloat((loc.Y / -100).toFixed(4));

            if (!markers[name]) markers[name] = [];
            markers[name].push({ map: MAP_NAME, x, y });
        }
    }

    return markers;
}

/** Orchestrate and write output. */
function extract() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const allFiles = getFiles(DATA_DIR);
    const grouped: Record<string, { x: number; y: number; map: string }[]> = {};

    for (const file of allFiles) {
        const markers = extractMarkers(file);
        for (const [name, entries] of Object.entries(markers)) {
            grouped[name] ??= [];
            grouped[name].push(...entries);
        }
    }

    for (const [name, entries] of Object.entries(grouped)) {
        const filePath = path.join(OUTPUT_DIR, `${name}.json`);
        const formatted =
            '[\n' +
            entries
                .map(
                    (entry) =>
                        '  { ' +
                        `\"map\": \"${entry.map}\", ` +
                        `\"x\": ${entry.x}, ` +
                        `\"y\": ${entry.y}` +
                        ' }'
                )
                .join(',\n') +
            '\n]\n';
        fs.writeFileSync(filePath, formatted, 'utf-8');
        console.log(`Wrote ${entries.length} entries to ${filePath}`);
    }
}

extract();
