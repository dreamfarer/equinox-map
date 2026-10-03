import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { contentDir } from './paths';

/** An object of a package exported by FModel. */
export type GameObject = {
    Type: string;
    Name: string;
    Properties?: Record<string, unknown>;
    [key: string]: unknown;
};

type ObjectReference = { ObjectName: string; ObjectPath: string };
type SoftObjectPath = { AssetPathName: string };
type Text = {
    LocalizedString?: string;
    SourceString?: string;
    CultureInvariantString?: string | null;
};

const packages = new Map<string, GameObject[]>();

function isObjectReference(value: unknown): value is ObjectReference {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as ObjectReference).ObjectPath === 'string'
    );
}

/**
 * Convert a game path to the path of its FModel export.
 * @param gamePath - The path within the game, such as `/Game/Blueprints/Items`.
 * @returns The path on disk, without a file extension.
 */
export function toExportPath(gamePath: string): string {
    if (!gamePath.startsWith('/Game/')) {
        throw new Error(`"${gamePath}" is not part of the game content.`);
    }
    return path.join(contentDir, gamePath.slice('/Game/'.length));
}

/**
 * Read a package exported with **Save Folder's Packages Properties (.json)**.
 * @param gamePath - The path of the package, such as `/Game/Blueprints/Data/Shops/DA_Shop_Wendy`.
 * @returns The objects of the package.
 */
export function readPackage(gamePath: string): GameObject[] {
    const cached = packages.get(gamePath);
    if (cached) return cached;

    const filePath = `${toExportPath(gamePath)}.json`;
    if (!existsSync(filePath)) {
        throw new Error(
            `${gamePath} is missing in the FModel export. Export its folder as described in how-to-update.md.`
        );
    }
    const objects = JSON.parse(readFileSync(filePath, 'utf8')) as GameObject[];
    packages.set(gamePath, objects);
    return objects;
}

/**
 * List the packages of an exported directory, including its subdirectories.
 * @param gameDir - The directory within the game, such as `/Game/Blueprints/Data/Shops`.
 * @returns The game paths of all packages in the directory.
 */
export function listPackages(gameDir: string): string[] {
    const exportDir = toExportPath(gameDir);
    if (!existsSync(exportDir)) {
        throw new Error(
            `${gameDir} is missing in the FModel export. Export it as described in how-to-update.md.`
        );
    }
    return (readdirSync(exportDir, { recursive: true }) as string[])
        .filter((file) => file.endsWith('.json'))
        .map(
            (file) =>
                `${gameDir}/${file.slice(0, -'.json'.length).split(path.sep).join('/')}`
        )
        .sort();
}

/**
 * Follow a reference to another object, such as `/Game/Blueprints/Data/Shops/DA_Shop_Wendy.3`.
 * The number after the dot is the position of the object within its package.
 * @param reference - The reference as exported by FModel.
 * @returns The referenced object or `undefined` if nothing is referenced.
 */
export function resolveObject(reference: unknown): GameObject | undefined {
    if (!isObjectReference(reference)) return undefined;

    const [, gamePath, index] =
        reference.ObjectPath.match(/^(.+)\.(\d+)$/) ?? [];
    if (!gamePath) {
        throw new Error(`Unexpected object path "${reference.ObjectPath}".`);
    }
    const object = readPackage(gamePath)[Number(index)];
    if (!object) {
        throw new Error(`${reference.ObjectPath} doesn't exist.`);
    }
    return object;
}

/**
 * Follow a soft reference to the first object of another package, such as
 * `/Game/Blueprints/Data/Currency/DA_Currency_Moss.DA_Currency_Moss`.
 * @param reference - The soft reference as exported by FModel.
 * @returns The game path of the referenced package or `undefined` if nothing is referenced.
 */
export function readSoftPath(reference: unknown): string | undefined {
    const assetPathName = (reference as SoftObjectPath | null)?.AssetPathName;
    if (!assetPathName || assetPathName === 'None') return undefined;
    return assetPathName.split('.')[0];
}

/**
 * Read a text exactly as the game displays it in English.
 * @param text - The text as exported by FModel.
 * @returns The text or `undefined` if it is empty.
 */
export function readText(text: unknown): string | undefined {
    const { LocalizedString, SourceString, CultureInvariantString } =
        (text as Text | null) ?? {};
    const value = LocalizedString ?? SourceString ?? CultureInvariantString;
    return value?.trim() || undefined;
}

/**
 * Read the name of an enumerator, such as `Speed` from `EPlayerStatType::Speed`.
 * @param value - The enumerator as exported by FModel.
 * @returns The name or `undefined` if it isn't set.
 */
export function readEnum(value: unknown): string | undefined {
    return typeof value === 'string' ? value.split('::').pop() : undefined;
}

/**
 * Read the default properties of a blueprint class. A blueprint only stores
 * the properties that differ from its parent, so everything it inherits from
 * its parent blueprints is merged in.
 * @param reference - The reference to the blueprint class.
 * @returns The merged properties and the name of the C++ class the blueprints derive from.
 */
export function readClassDefaults(reference: unknown): {
    properties: Record<string, unknown>;
    nativeClass: string;
} {
    const blueprint = resolveObject(reference);
    if (!blueprint) throw new Error('Missing reference to a blueprint class.');

    const defaults = resolveObject(blueprint.ClassDefaultObject);
    const parent = blueprint.SuperStruct ?? blueprint.Super;
    if (!isObjectReference(parent)) {
        throw new Error(`${blueprint.Name} doesn't have a parent class.`);
    }

    if (parent.ObjectPath.startsWith('/Script/')) {
        return {
            properties: defaults?.Properties ?? {},
            nativeClass: parent.ObjectName.match(/'(.+)'/)?.[1] ?? '',
        };
    }

    const inherited = readClassDefaults(parent);
    return {
        properties: { ...inherited.properties, ...defaults?.Properties },
        nativeClass: inherited.nativeClass,
    };
}
