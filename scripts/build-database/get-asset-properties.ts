import { AssetDetail } from './types';

/** Get the name and ID of a LootLocker asset from the catalog ID in the Fiddler export.
 * @param catalogueId - The LootLocker asset/catalog ID.
 * @param assetDetails - The raw asset details from the Fiddler export.
 * @returns The name and legacy ID of the asset.
 */
export function getAssetProperties(
    catalogueId: string,
    assetDetails: AssetDetail[]
): { name: string; id: number }[] {
    return assetDetails
        .filter((assetDetail) => assetDetail.catalog_listing_id === catalogueId)
        .map((assetDetail) => ({
            name: assetDetail.name,
            id: assetDetail.legacy_id,
        }));
}
