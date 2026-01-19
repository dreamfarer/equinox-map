import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Map, Offset, Popup } from 'maplibre-gl';

type ReactPopupProps = {
    map: Map | null;
    lngLat: [number, number];
    isOpen: boolean;
    offset?: number | Offset;
    children: ReactNode;
};

export default function ReactPopup({
    map,
    lngLat,
    isOpen,
    offset,
    children,
}: ReactPopupProps) {
    const popupRef = useRef<Popup | null>(null);
    const container = useMemo(() => document.createElement('div'), []);

    useEffect(() => {
        if (!map) return;
        const popup = new Popup({
            offset,
            closeButton: false,
            className: 'equinox-popup',
        }).setDOMContent(container);
        popupRef.current = popup;
        return () => {
            popup.remove();
            popupRef.current = null;
        };
    }, [map, container, offset]);

    useEffect(() => {
        const popup = popupRef.current;
        if (!popup || !map) return;
        popup.setLngLat(lngLat);
        if (isOpen) popup.addTo(map);
        else popup.remove();
    }, [map, lngLat, isOpen]);

    if (!map) return null;
    return createPortal(children, container);
}
