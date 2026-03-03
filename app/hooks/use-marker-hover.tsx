'use client';

import { useEffect } from 'react';
import { useMapContext } from '@/app/context/map-context';
import { extractFeature } from '@/lib/extract-feature';
import { MarkerLayerEvent } from '@/types/marker-layer-event';

const BASE_LAYER = 'markers-layer';
const SOURCE_ID = 'markers';

export function useMarkerHover() {
    const { mapInstance } = useMapContext();

    useEffect(() => {
        if (!mapInstance) return;

        let hoveredId: string | number | null = null;

        const setHoverState = (id: string | number | null) => {
            if (hoveredId != null) {
                mapInstance.setFeatureState(
                    { source: SOURCE_ID, id: hoveredId },
                    { hover: false }
                );
            }
            hoveredId = id;
            if (hoveredId != null) {
                mapInstance.setFeatureState(
                    { source: SOURCE_ID, id: hoveredId },
                    { hover: true }
                );
            }
        };

        const deactivateHover = () => {
            setHoverState(null);
            mapInstance.getCanvas().style.cursor = '';
        };

        const activateHover = (id: string | number) => {
            setHoverState(id);
            mapInstance.getCanvas().style.cursor = 'pointer';
        };

        const onMove = (event: MarkerLayerEvent) => {
            const feature = extractFeature(mapInstance, event);
            if (!feature) {
                if (hoveredId != null) deactivateHover();
                return;
            }
            const id = feature.id;
            if (id == null || hoveredId === id) return;
            activateHover(id);
        };

        const onLeave = () => {
            if (hoveredId != null) deactivateHover();
        };

        mapInstance.on('mousemove', BASE_LAYER, onMove);
        mapInstance.on('mouseleave', BASE_LAYER, onLeave);

        return () => {
            deactivateHover();
            mapInstance.off('mousemove', BASE_LAYER, onMove);
            mapInstance.off('mouseleave', BASE_LAYER, onLeave);
        };
    }, [mapInstance]);
}
