import path from 'node:path';

/**
 * Not every item's Properties set `Slot` (e.g. shoes never do, and roughly
 * two thirds of items omit it entirely), but every item lives under a
 * directory that reflects its category 1:1 with the `Slot` values that do
 * appear (e.g. `Clothing/Gloves` items always have
 * `Slot: ELoadoutSlot::Gloves`). So instead of reading `Slot`, `type` is
 * derived from the item's directory relative to `itemsRoot`, which gives
 * complete coverage and the same values `Slot` would have produced anyway.
 */
const typeByDirectory: Record<string, string> = {
    Body: 'Body',
    'Body/Chin': 'Chin',
    'Body/Eyebrows': 'Eyebrows',
    'Body/Eyes': 'Eyes',
    'Body/Face': 'BodyFace',
    'Body/Jaw': 'Jaw',
    'Body/Lips': 'Lips',
    'Body/Nose': 'Nose',
    'Body/SkinTypes': 'SkinType',
    'Clothing/Gloves': 'Gloves',
    'Clothing/Hats': 'Hat',
    'Clothing/Pants': 'Pants',
    'Clothing/Shirts': 'ShirtCosmetic',
    'Clothing/Shoes': 'Shoes',
    'CoatPatterns/Body': 'CoatPatternBody',
    'CoatPatterns/Face': 'CoatPatternFace',
    'CoatPatterns/Socks': 'CoatPatternSocks',
    FastTravel: 'FastTravel',
    Feathering: 'Feathering',
    Hair: 'Hair',
    'Hair/Colors': 'HairColor',
    'Hair/Old': 'Hair',
    'Makeup/Blush': 'Blush',
    'Makeup/EyeLiner': 'EyeLiner',
    'Makeup/Eyeshadow': 'Eyeshadow',
    'Makeup/Lipstick': 'Lipstick',
    Manes: 'Mane',
    'Manes/Colors': 'ManeColor',
    QuestTriggers: 'QuestTrigger',
    'Tack/Accessories': 'ManeAccessory',
    'Tack/Blanket': 'Blanket',
    'Tack/Bridles': 'Bridle',
    'Tack/Girth': 'Girth',
    'Tack/HorseShoes': 'Horseshoes',
    'Tack/Legwraps': 'Legwraps',
    'Tack/Saddles': 'SaddleCosmetic',
    Tails: 'Tail',
};

interface FmodelItemProperties {
    BaseStat?: string;
    UpgradeCosts?: {
        ObjectName?: string;
    };
    DisplayName?: {
        LocalizedString?: string;
    };
    Image?: {
        AssetPathName?: string;
    };
}

export type FmodelItemExport = {
    Properties?: FmodelItemProperties;
}[];

function splitPascalCase(value: string): string {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

/**
 * Extract the display-relevant fields from a matched fmodel export. Items
 * don't all set the same properties (e.g. cosmetics have no BaseStat), so
 * each field is only included when present.
 *
 * `itemDirectory` is the export's directory relative to `itemsRoot` (e.g.
 * `Clothing/Shoes`), used to look up `type` in `typeByDirectory`.
 *
 * When an item has an icon, its source PNG path (resolved against
 * `contentRoot`) is recorded in `imageSources`, keyed by the same file name
 * used in the returned `imagePath`, so the caller can convert every
 * referenced icon in one batch once all items have been parsed.
 */
export function parseFmodelExport(
    fmodelExport: FmodelItemExport,
    itemDirectory: string,
    contentRoot: string,
    imageSources: Map<string, string>
): {
    type: string;
    upgradeItem?: string;
    statsType?: string;
    name?: string;
    imagePath?: string;
} {
    const properties =
        fmodelExport.find((object) => object.Properties)?.Properties ?? {};

    const type = typeByDirectory[itemDirectory];
    if (!type) {
        throw new Error(`No type mapping for directory "${itemDirectory}"`);
    }
    const fields: ReturnType<typeof parseFmodelExport> = { type };

    if (
        properties.BaseStat &&
        properties.BaseStat !== 'EPlayerStatType::None'
    ) {
        fields.statsType = properties.BaseStat.replace(
            /^EPlayerStatType::/,
            ''
        );
    }

    const upgradeCostsMatch = properties.UpgradeCosts?.ObjectName?.match(
        /'DA_ItemUpgradeCosts_(.+)'/
    );
    if (upgradeCostsMatch) {
        fields.upgradeItem = splitPascalCase(upgradeCostsMatch[1]);
    }

    if (properties.DisplayName?.LocalizedString) {
        fields.name = properties.DisplayName.LocalizedString;
    }

    const assetPathName = properties.Image?.AssetPathName;
    const imageFileName = assetPathName?.split('/').pop()?.split('.')[0];
    if (assetPathName && imageFileName) {
        fields.imagePath = `/icon/256/${imageFileName}.webp`;
        imageSources.set(
            imageFileName,
            path.join(
                contentRoot,
                assetPathName.replace(/^\/Game\//, '').split('.')[0] + '.png'
            )
        );
    }

    return fields;
}
