import { AssetDetail } from './types';

export function parseAssets(
    catalogueId: string,
    assetDetails: AssetDetail[]
): { name: string; legacyId: number }[] {
    return assetDetails
        .filter((assetDetail) => assetDetail.catalog_listing_id === catalogueId)
        .map((assetDetail) => ({
            name: assetDetail.name,
            legacyId: assetDetail.legacy_id,
        }));
}
