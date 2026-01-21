import { Map } from 'maplibre-gl';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';

/**
 * Load the raw markers as GeoJSON for MapLibre.
 */
export async function loadMarkers(): Promise<TMarkerFeatureCollection> {
    return fetch('/markers/markers.geojson').then((r) => r.json());
}

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
