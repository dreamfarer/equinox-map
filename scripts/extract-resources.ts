import fs from 'fs';
import path from 'path';

type Marker = {
    x: number;
    y: number;
    map: string;
};
type Markers = Record<string, Marker[]>;
type UEVector = { X: number; Y: number; Z?: number };
type UEJsonObject = {
    Type?: string;
    Name?: string;
    Outer?: string;
    Template?: { ObjectName?: string };
    Properties?: { RelativeLocation?: UEVector };
};

const DATA_DIR = path.resolve(__dirname, 'data'); // input directory of raw Unreal Engine data
const OUTPUT_DIR = path.resolve(__dirname, '../public/markers/resources'); // output directory for the map
const MAP_NAME = 'greenisland'; // map name

/** Convert internal names to a more human-readable format. */
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
    artifact: 'artefacts',
};

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null;
}

function asUEJsonObject(v: unknown): UEJsonObject | null {
    if (!isRecord(v)) return null;

    const obj: UEJsonObject = {};

    if (typeof v.Type === 'string') obj.Type = v.Type;
    if (typeof v.Name === 'string') obj.Name = v.Name;
    if (typeof v.Outer === 'string') obj.Outer = v.Outer;

    if (isRecord(v.Template)) {
        const tpl: UEJsonObject['Template'] = {};
        if (typeof v.Template.ObjectName === 'string')
            tpl.ObjectName = v.Template.ObjectName;
        obj.Template = tpl;
    }

    if (isRecord(v.Properties) && isRecord(v.Properties.RelativeLocation)) {
        const rl = v.Properties.RelativeLocation;

        const X = typeof rl.X === 'number' ? rl.X : null;
        const Y = typeof rl.Y === 'number' ? rl.Y : null;
        const Z = typeof rl.Z === 'number' ? rl.Z : undefined;

        if (X !== null && Y !== null) {
            obj.Properties = { RelativeLocation: { X, Y, Z } };
        }
    }

    return obj;
}

function getXY(obj: UEJsonObject): { x: number; y: number } | null {
    const loc = obj.Properties?.RelativeLocation;
    if (!loc) return null;

    const x = parseFloat((loc.X / -100).toFixed(4));
    const y = parseFloat((loc.Y / -100).toFixed(4));
    return { x, y };
}

type Strategy = {
    type: string;
    name: string;
    matches?: (obj: UEJsonObject) => boolean;
    getKeyName: (obj: UEJsonObject) => string | null;
};

const strategies: Strategy[] = [
    {
        type: 'SceneComponent',
        name: 'DefaultSceneRoot',
        matches: (obj) => typeof obj.Template?.ObjectName === 'string',
        getKeyName: (obj) => {
            const objectName = obj.Template?.ObjectName;
            if (!objectName) return null;

            const match = objectName.match(
                /BP_CollectableItem_Currency_(.*?)_/
            );
            if (!match) return null;

            return match[1].toLowerCase();
        },
    },
    {
        type: 'SceneComponent',
        name: 'Scene',
        matches: (obj) =>
            typeof obj.Outer === 'string'
                ? /BP_Artifact[0-9]{2}_C/.test(obj.Outer)
                : false,
        getKeyName: () => 'artifact',
    },
];

/** Collect all file paths recursively from the data directory. */
function getFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const fileInfo = fs.statSync(fullPath);
        if (fileInfo.isDirectory()) {
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

    let parsed: unknown;
    try {
        parsed = JSON.parse(rawFile) as unknown;
    } catch {
        console.warn(`Invalid JSON in ${filePath}`);
        return markers;
    }

    if (!Array.isArray(parsed)) return markers;

    for (const entry of parsed) {
        const obj = asUEJsonObject(entry);
        if (!obj) continue;
        const xy = getXY(obj);
        if (!xy) continue;
        for (const strat of strategies) {
            if (obj.Type !== strat.type) continue;
            if (obj.Name !== strat.name) continue;
            if (strat.matches && !strat.matches(obj)) continue;
            const rawKey = strat.getKeyName(obj);
            if (!rawKey) continue;
            const name = nameOverrides[rawKey] ?? rawKey;
            markers[name] ??= [];
            markers[name].push({ map: MAP_NAME, x: xy.x, y: xy.y });
            break;
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
    const grouped: Record<string, Marker[]> = {};
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
                        '    { ' +
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
