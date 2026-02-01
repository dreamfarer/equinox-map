import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Offset, Popup as MapLibrePopup } from 'maplibre-gl';
import { useMapContext } from '@/app/context/map-context';
import { useMarkerContext } from '@/app/context/marker-context';

export default function ReactPopup({ children }: { children: ReactNode }) {
    const { mapInstance } = useMapContext();
    const { activePopup } = useMarkerContext();
    const popupRef = useRef<MapLibrePopup | null>(null);
    const container = useMemo(() => document.createElement('div'), []);

    useEffect(() => {
        if (!mapInstance || !activePopup) return;
        const popup = new MapLibrePopup({
            offset: activePopup.offset as Offset,
            closeButton: false,
            className: 'equinox-popup',
        }).setDOMContent(container);
        popupRef.current = popup;
        return () => {
            popup.remove();
            popupRef.current = null;
        };
    }, [mapInstance, container, activePopup]);

    useEffect(() => {
        if (!popupRef.current || !mapInstance) return;
        if (!activePopup) {
            popupRef.current.remove();
            return;
        }
        popupRef.current.setLngLat(activePopup.lngLat);
        popupRef.current.addTo(mapInstance);
    }, [mapInstance, activePopup]);

    if (!mapInstance) return null;
    return createPortal(children, container);
}
