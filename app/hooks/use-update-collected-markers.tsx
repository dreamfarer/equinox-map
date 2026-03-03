import type { Map } from 'maplibre-gl';
import { useCallback, useEffect, useRef } from 'react';
import { useMarkerContext } from '@/app/context/marker-context';
import { useMapContext } from '@/app/context/map-context';
import { saveCollectedMarkerIdsToLocalStorage } from '@/lib/storage-utility';

function dim(mapInstance: Map | null, id: Set<string>, state: boolean) {
    if (!mapInstance) return;
    if (!mapInstance.getSource?.('markers')) return;
    id.forEach((markerId) => {
        mapInstance.setFeatureState(
            { source: 'markers', id: markerId },
            { dim: state }
        );
    });
}

export function useUpdateCollectedMarkers() {
    const { mapInstance } = useMapContext();
    const { collectedMarkerIds } = useMarkerContext();
    const prevRef = useRef<Set<string>>(collectedMarkerIds);

    const setDimOnCollectedMarkers = useCallback(() => {
        dim(mapInstance, collectedMarkerIds, true);
    }, [mapInstance, collectedMarkerIds]);

    const updateDimOnCollectedMarkers = useCallback(() => {
        const prev = prevRef.current;
        const added = new Set(
            collectedMarkerIds.values().filter((id) => !prev.has(id))
        );
        const removed = new Set(
            prev.values().filter((id) => !collectedMarkerIds.has(id))
        );
        dim(mapInstance, removed, false);
        dim(mapInstance, added, true);
        prevRef.current = new Set(collectedMarkerIds);
        saveCollectedMarkerIdsToLocalStorage(collectedMarkerIds);
    }, [mapInstance, collectedMarkerIds]);

    useEffect(() => {
        if (!mapInstance) return;
        updateDimOnCollectedMarkers();
        const onStyleData = () => {
            setDimOnCollectedMarkers(); // dim collected on startup
        };
        mapInstance.on('styledata', onStyleData);
        return () => {
            mapInstance.off('styledata', onStyleData);
        };
    }, [mapInstance, setDimOnCollectedMarkers, updateDimOnCollectedMarkers]);
}
