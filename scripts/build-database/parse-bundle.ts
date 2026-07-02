import { AssetDetail } from './types';

export function parseBundle(
    catalogueId: string,
    assetDetails: AssetDetail[]
): string[] {
    return assetDetails
        .filter((assetDetail) => assetDetail.catalog_listing_id === catalogueId)
        .map((assetDetail) => assetDetail.name);
}
