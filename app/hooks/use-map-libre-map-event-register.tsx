'use client';

import { useEffect, useRef } from 'react';
import type { MapLayerMouseEvent, MapLayerTouchEvent } from 'maplibre-gl';
import { useMapContext } from '@/app/context/map-context';
import type { TMarkerFeature } from '@/types/marker-feature';
import { usePopupContext } from '@/app/context/popup-context';

type MarkerLayerEvent = MapLayerMouseEvent | MapLayerTouchEvent;

function extractFeature(event: MarkerLayerEvent): TMarkerFeature | null {
    if (!event.features?.length) return null;
    return event.features[0] as unknown as TMarkerFeature; // TODO: tighten type
}

export function useMapLibreMapEventRegister() {
    const { mapInstance } = useMapContext();
    const { activePopup, setActivePopupByFeature } = usePopupContext();
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
            const markerId = feature.properties.id as string;
            if (activePopup && activePopup.id === markerId) {
                return setActivePopupByFeature(null);
            }
            setActivePopupByFeature(feature);
        };

        const onContextMenu = (event: MarkerLayerEvent) => {
            const feature = extractFeature(event);
            if (!feature) return;
            event.preventDefault();
            const id = feature.properties.id;
            const key = { source: 'markers', id };
            const current = mapInstance.getFeatureState(key);
            mapInstance.setFeatureState(key, { dim: !current.dim });
        };

        const onTouchStart = (event: MarkerLayerEvent) => {
            const feature = extractFeature(event);
            if (!feature) return;
            cancelLongPress();
            longPressTimerIdRef.current = window.setTimeout(() => {
                const feature = extractFeature(event);
                if (!feature) return;
                const id = feature.properties.id;
                const key = { source: 'markers', id };
                const current = mapInstance.getFeatureState(key);
                mapInstance.setFeatureState(key, { dim: !current.dim });
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
    }, [activePopup, mapInstance, setActivePopupByFeature]);
}
