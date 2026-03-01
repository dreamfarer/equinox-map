import { useMarkerContext } from '@/app/context/marker-context';
import { useCallback } from 'react';
import { useMapContext } from '@/app/context/map-context';

export function useFlyToMarker() {
    const { allMarkers, setActivePopupByFeature } = useMarkerContext();
    const { mapInstance } = useMapContext();
    return useCallback(
        (markerId: string) => {
            const feature = allMarkers.features.find(
                (f) => f.properties.id === markerId
            );
            if (!feature || !mapInstance) return;
            const [lng, lat] = feature.geometry.coordinates;
            mapInstance.flyTo({
                center: [lng, lat],
                zoom: 6,
                essential: true,
            });
            setActivePopupByFeature(feature);
        },
        [allMarkers.features, mapInstance, setActivePopupByFeature]
    );
}
