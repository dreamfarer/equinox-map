import { useCallback } from 'react';
import { Map } from 'maplibre-gl';
import { ExtendedMap } from '@/types/extended-map';
import { Popups } from '@/types/popup';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';

export function useFlyToMarker(
    map: Map | null,
    popups: Popups,
    markers: TMarkerFeatureCollection | null
) {
    return useCallback(
        (markerId: string, categoryId?: string) => {
            if (!map || !markers) return;

            const markerData = popups[markerId];
            const feature = markers.features.find(
                (f) => f.properties.id === markerId
            );

            if (!markerData || !feature) return;

            const [lng, lat] = feature.geometry.coordinates;

            const extendedMap = map as ExtendedMap;
            const categoryKeys = Object.keys(markerData);
            extendedMap.__requestedCategoryForPopup =
                categoryId && categoryKeys.includes(categoryId)
                    ? categoryId
                    : categoryKeys[0];

            extendedMap.flyTo({
                center: [lng, lat],
                zoom: 6,
                essential: true,
            });
        },
        [map, popups, markers]
    );
}
