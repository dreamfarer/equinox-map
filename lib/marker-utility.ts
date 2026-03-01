import { Map } from 'maplibre-gl';

/**
 * Load marker icons.
 */
export async function loadIcon(
    map: Map,
    url: string
): Promise<HTMLImageElement | ImageBitmap> {
    const result = await map.loadImage(url);
    return result.data;
}
