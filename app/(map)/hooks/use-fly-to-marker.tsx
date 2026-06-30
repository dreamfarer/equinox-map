import { useMarkerContext } from '@/app/(map)/context/marker-context';
import { useCallback } from 'react';
import { useMapContext } from '@/app/(map)/context/map-context';
import { useRouter } from 'next/navigation';

export function useFlyToMarker() {
    const { allFeatures, setActivePopupByFeature } = useMarkerContext();
    const { mapInstance, activeMapId, setPendingFlyToMarkerId } =
        useMapContext();
    const router = useRouter();

    return useCallback(
        (markerId: string) => {
            const feature = allFeatures[markerId];
            if (!feature) return;

            if (feature.properties.map === activeMapId) {
                if (!mapInstance) return;
                const [lng, lat] = feature.geometry.coordinates;
                mapInstance.flyTo({
                    center: [lng, lat],
                    zoom: 6,
                    essential: true,
                });
                setActivePopupByFeature(feature);
            } else {
                const targetMapId = feature.properties.map;
                router.replace(
                    targetMapId === 'alderwood' ? '/' : `/${targetMapId}`
                );
                setPendingFlyToMarkerId(markerId);
            }
        },
        [
            allFeatures,
            mapInstance,
            activeMapId,
            setActivePopupByFeature,
            setPendingFlyToMarkerId,
            router,
        ]
    );
}
