import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Offset, Popup as MapLibrePopup } from 'maplibre-gl';
import { useMapContext } from '@/app/context/map-context';
import { calculatePopupOffset } from '@/lib/popup-utility';

export default function ReactPopup({ children }: { children: ReactNode }) {
    const { mapInstance, openPopup } = useMapContext();
    const popupRef = useRef<MapLibrePopup | null>(null);
    const container = useMemo(() => document.createElement('div'), []);

    useEffect(() => {
        if (!mapInstance) return;
        const anchor = openPopup?.feature.properties.anchor;
        if (!anchor) return;
        const offset = calculatePopupOffset(anchor);
        const popup = new MapLibrePopup({
            offset: offset as Offset,
            closeButton: false,
            className: 'equinox-popup',
        }).setDOMContent(container);
        popupRef.current = popup;
        return () => {
            popup.remove();
            popupRef.current = null;
        };
    }, [mapInstance, container, openPopup]);

    useEffect(() => {
        if (!popupRef.current || !mapInstance) return;
        if (!openPopup) {
            popupRef.current.remove();
            return;
        }
        popupRef.current.setLngLat(openPopup.lngLat);
        popupRef.current.addTo(mapInstance);
    }, [mapInstance, openPopup]);

    if (!mapInstance) return null;
    return createPortal(children, container);
}
