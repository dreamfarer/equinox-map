'use client';

import { useEffect, useRef } from 'react';
import { useMapContext } from '@/app/context/map-context';
import { TMarkerFeature } from '@/types/marker-feature';
import { MapGeoJSONFeature } from 'maplibre-gl';

type MarkerLayerEvent = {
    features?: MapGeoJSONFeature[];
    preventDefault?: () => void;
};

function extractFeature(event: MarkerLayerEvent): TMarkerFeature | null {
    if (!event.features?.length) return null;
    return event.features[0] as unknown as TMarkerFeature; // TODO: tighten type
}

export function usePopupEventRegister() {
    const { mapInstance } = useMapContext();
    const longPressTimerIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!mapInstance) return;

        const cancelLongPress = () => {
            const id = longPressTimerIdRef.current;
            if (id !== null) {
                window.clearTimeout(id);
                longPressTimerIdRef.current = null;
            }
        };

        const onClick = (event: MarkerLayerEvent) => {
            const feature = extractFeature(event);
            if (!feature) return;
            // Check if the same popup is already open.
            // Open popup.
        };

        const onContextMenu = (event: MarkerLayerEvent) => {
            const feature = extractFeature(event);
            if (!feature) return;
            event.preventDefault?.();
            // Toggle collected status.
        };

        const onTouchStart = (event: MarkerLayerEvent) => {
            const feature = extractFeature(event);
            if (!feature) return;

            cancelLongPress();
            longPressTimerIdRef.current = window.setTimeout(() => {
                // long press action for this feature
            }, 500);
        };

        mapInstance.on('click', 'markers-layer', onClick);
        mapInstance.on('contextmenu', 'markers-layer', onContextMenu);
        mapInstance.on('touchstart', 'markers-layer', onTouchStart);
        mapInstance.on('touchmove', cancelLongPress);
        mapInstance.on('touchend', cancelLongPress);
        mapInstance.on('touchcancel', cancelLongPress);

        return () => {
            cancelLongPress();
            mapInstance.off('click', 'markers-layer', onClick);
            mapInstance.off('contextmenu', 'markers-layer', onContextMenu);
            mapInstance.off('touchstart', 'markers-layer', onTouchStart);
            mapInstance.off('touchmove', cancelLongPress);
            mapInstance.off('touchend', cancelLongPress);
            mapInstance.off('touchcancel', cancelLongPress);
        };
    }, [mapInstance]);
}
