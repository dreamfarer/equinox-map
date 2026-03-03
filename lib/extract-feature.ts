import { MarkerLayerEvent } from '@/types/marker-layer-event';
import { TMarkerFeature } from '@/types/marker-feature';
import type { Map } from 'maplibre-gl';

export function extractFeature(
    mapInstance: Map,
    event: MarkerLayerEvent
): TMarkerFeature | null {
    const features = mapInstance.queryRenderedFeatures(event.point, {
        layers: ['markers-layer'],
    });
    if (!features?.length) return null;
    return features[0] as unknown as TMarkerFeature;
}
