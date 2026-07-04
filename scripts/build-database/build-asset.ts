import path from 'node:path';
import { typeByDirectory } from './schema/types';
import { splitPascalCase } from '../../lib/split-pascal-case';
import { readFile } from 'node:fs/promises';

interface FModelItemProperties {
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

type FModelItemExport = {
    Properties?: FModelItemProperties;
}[];

type FModelExportCleaned = {
    type: string;
    upgradeItem?: string;
    statsType?: string;
    name?: string;
    imagePath?: string;
};

/**
 * Parse the FModel export (*local data*) and compress/filter it and rename fields.
 * @param filePath - The path to the to-be-parsed asset.
 * @param itemDirectory - The directory the asset is defined.
 * @param contentRoot - The game content directory.
 * @param imageSources - The shared map to collect all thumbnail paths.
 */
export async function buildAsset(
    filePath: string,
    itemDirectory: string,
    contentRoot: string,
    imageSources: Map<string, string>
): Promise<FModelExportCleaned> {
    const fModelExport = JSON.parse(
        await readFile(filePath, 'utf8')
    ) as FModelItemExport;

    const properties =
        fModelExport.find((object) => object.Properties)?.Properties ?? {};

    const type = typeByDirectory[itemDirectory];
    if (!type) {
        throw new Error(`No type mapping for directory "${itemDirectory}"`);
    }
    const fields: FModelExportCleaned = { type };

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
