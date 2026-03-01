'use client';

import { useEffect, useRef } from 'react';
import { useMapContext } from '@/app/context/map-context';
import { useMarkerContext } from '@/app/context/marker-context';
import { MarkerLayerEvent } from '@/types/marker-layer-event';
import { extractFeature } from '@/lib/extract-feature';

export function useMapLibreMapEventRegister() {
    const { mapInstance } = useMapContext();
    const { setCollectedMarkerIds } = useMarkerContext();
    const { activePopup, setActivePopupByFeature } = useMarkerContext();
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
            const feature = extractFeature(mapInstance, event);
            if (!feature) return;
            const markerId = feature.properties.id as string;
            if (activePopup && activePopup.featureId === markerId) {
                return setActivePopupByFeature(null);
            }
            setActivePopupByFeature(feature);
        };

        const onContextMenu = (event: MarkerLayerEvent) => {
            const feature = extractFeature(mapInstance, event);
            if (!feature) return;
            event.preventDefault();
            const id = String(feature.properties.id);
            setCollectedMarkerIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
                return next;
            });
        };

        const onTouchStart = (event: MarkerLayerEvent) => {
            const feature = extractFeature(mapInstance, event);
            if (!feature) return;
            cancelLongPress();
            longPressTimerIdRef.current = window.setTimeout(() => {
                const feature = extractFeature(mapInstance, event);
                if (!feature) return;
                const id = feature.properties.id;
                setCollectedMarkerIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) {
                        next.delete(id);
                    } else {
                        next.add(id);
                    }
                    return next;
                });
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
    }, [
        activePopup,
        mapInstance,
        setActivePopupByFeature,
        setCollectedMarkerIds,
    ]);
}
