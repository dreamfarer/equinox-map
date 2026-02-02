import { useEffect, useRef } from 'react';
import { useMarkerContext } from '@/app/context/marker-context';
import { useMapContext } from '@/app/context/map-context';

export function useUpdateCollectedMarkers() {
    const { mapInstance } = useMapContext();
    const { collectedMarkerIds } = useMarkerContext();
    const collectedMarkerIdsRef = useRef<Set<string>>(collectedMarkerIds);

    useEffect(() => {
        if (!mapInstance) return;
        const prev = collectedMarkerIdsRef.current;
        const added = [...collectedMarkerIds].filter((id) => !prev.has(id));
        const removed = [...prev].filter((id) => !collectedMarkerIds.has(id));
        added.forEach((id) => {
            mapInstance.setFeatureState(
                { source: 'markers', id },
                { dim: true }
            );
        });
        removed.forEach((id) => {
            mapInstance.setFeatureState(
                { source: 'markers', id },
                { dim: false }
            );
        });
        collectedMarkerIdsRef.current = collectedMarkerIds;
    }, [collectedMarkerIds, mapInstance]);
}
