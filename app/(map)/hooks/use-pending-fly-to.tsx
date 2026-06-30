import { useEffect } from 'react';
import { useMapContext } from '@/app/(map)/context/map-context';
import { useMarkerContext } from '@/app/(map)/context/marker-context';

export function usePendingFlyTo() {
    const {
        mapInstance,
        activeMapId,
        pendingFlyToMarkerId,
        setPendingFlyToMarkerId,
    } = useMapContext();
    const { allFeatures, setActivePopupByFeature } = useMarkerContext();

    useEffect(() => {
        if (!pendingFlyToMarkerId || !mapInstance) return;
        const feature = allFeatures[pendingFlyToMarkerId];
        if (!feature || feature.properties.map !== activeMapId) return;

        const [lng, lat] = feature.geometry.coordinates;
        const fly = () => {
            mapInstance.flyTo({ center: [lng, lat], zoom: 6, essential: true });
            setActivePopupByFeature(feature);
            setPendingFlyToMarkerId(null);
        };
        mapInstance.once('idle', fly);
        return () => {
            mapInstance.off('idle', fly);
        };
    }, [
        pendingFlyToMarkerId,
        mapInstance,
        activeMapId,
        allFeatures,
        setActivePopupByFeature,
        setPendingFlyToMarkerId,
    ]);
}
