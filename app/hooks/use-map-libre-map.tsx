'use client';

import { useEffect, useRef } from 'react';
import {
    Map as MapLibreMap,
    type MapLayerMouseEvent,
    type MapLayerTouchEvent,
    Marker,
} from 'maplibre-gl';
import { TMarkerDev } from '@/types/marker-dev';
import {
    convertToUnit,
    getMapBoundsLatLng,
    vhToPx,
    remToPx,
} from '@/lib/convert';
import { useMapContext } from '@/app/context/map-context';
import { useDevMode } from '@/app/context/dev-mode-context';
import { useMarkerContext } from '@/app/context/marker-context';

type MarkerLayerEvent = MapLayerMouseEvent | MapLayerTouchEvent;

export function useMapLibreMap() {
    const { mapContainer, mapMetadata, activeMap, setMapInstance } =
        useMapContext();
    const { setActivePopupByFeature } = useMarkerContext();
    const { isDevMode } = useDevMode();

    const mapRef = useRef<MapLibreMap | null>(null);

    useEffect(() => {
        const el = mapContainer.current;
        if (!el || !mapMetadata || !activeMap) return;

        const meta = mapMetadata[activeMap];
        if (!meta) return;

        const isDev = process.env.NODE_ENV === 'development';
        const tiles = isDev ? meta.devUrl : meta.prodUrl;
        const bounds = getMapBoundsLatLng(meta);

        let wasMobile = el.offsetWidth < 768;

        const map = new MapLibreMap({
            container: el,
            style: {
                version: 8,
                sources: {
                    gameMap: {
                        type: 'raster',
                        tiles: [tiles],
                        tileSize: meta.tileSize,
                        scheme: 'xyz',
                        maxzoom: meta.maxZoom,
                        bounds,
                        attribution: meta.attribution,
                    },
                },
                layers: [
                    { id: 'gameMapLayer', type: 'raster', source: 'gameMap' },
                ],
            },
            zoom: meta.initZoom,
            minZoom: meta.minZoom,
            maxZoom: meta.maxOverscaledZoom,
            interactive: true,
            bearingSnap: 0,
            pitchWithRotate: false,
            dragRotate: false,
            renderWorldCopies: false,
            doubleClickZoom: false,
            attributionControl: false,
            fadeDuration: 0,
            transformRequest: (url) => ({ url }),
        });

        mapRef.current = map;

        const centreForLayout = (mobile: boolean) => {
            requestAnimationFrame(() => {
                map.resize();
                const padding = mobile
                    ? { top: 0, right: 0, bottom: vhToPx(40), left: 0 }
                    : { top: 0, right: 0, bottom: 0, left: remToPx(26.25) };
                map.setPadding(padding);
                map.fitBounds(bounds, { maxZoom: meta.maxZoom, linear: true });
            });
        };

        const ro = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;
            const isMobile = width < 768;
            if (isMobile !== wasMobile) {
                wasMobile = isMobile;
                centreForLayout(isMobile);
            }
        });

        const onClick = (event: MarkerLayerEvent) => {
            const { lng, lat } = event.lngLat;
            const [x, y] = convertToUnit(meta, lng, lat);
            const marker: TMarkerDev = { map: activeMap, x, y };
            const markerJson = JSON.stringify(marker, null, 2) + ',';
            console.log(markerJson);
            navigator.clipboard.writeText(markerJson).then();
            new Marker().setLngLat([lng, lat]).addTo(map);
        };

        if (isDevMode) map.on('click', onClick);

        map.touchZoomRotate.disableRotation();
        map.scrollZoom.enable();
        centreForLayout(wasMobile);
        ro.observe(el);

        setMapInstance?.(map);

        return () => {
            setMapInstance?.(null);
            setActivePopupByFeature?.(null);
            if (isDevMode) map.off('click', onClick);
            ro.disconnect();
            map.remove();
            mapRef.current = null;
        };
    }, [
        mapContainer,
        mapMetadata,
        activeMap,
        isDevMode,
        setMapInstance,
        setActivePopupByFeature,
    ]);

    return mapRef;
}
