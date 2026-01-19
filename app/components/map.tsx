'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './map.module.css';
import { useDevMode } from '../context/dev-mode-context';
import { TMarkerDev } from '@/types/marker-dev';
import {
    convertToUnit,
    getMapBoundsLatLng,
    vhToPx,
    remToPx,
} from '@/lib/convert';
import { useMapContext } from '@/app/context/map-context';
import ReactPopup from '@/app/components/map/react-popup';

export default function Map() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const { isDevMode } = useDevMode();
    const {
        mapMetadata,
        setMapInstance,
        activeMap,
        mapInstance,
        openPopup,
        setOpenPopup,
    } = useMapContext();

    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

    useEffect(() => {
        if (!mapContainer.current || !mapMetadata || !activeMap) return;

        const meta = mapMetadata[activeMap];
        if (!meta) return;

        const isDev = process.env.NODE_ENV === 'development';
        const tiles = isDev ? meta.devUrl : meta.prodUrl;
        const bounds = getMapBoundsLatLng(meta);
        let wasMobile = mapContainer.current.offsetWidth < 768;

        const map = new maplibregl.Map({
            container: mapContainer.current,
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
                    {
                        id: 'gameMapLayer',
                        type: 'raster',
                        source: 'gameMap',
                    },
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
            transformRequest: (url) => ({ url }),
        });

        const centreForLayout = (mobile: boolean) => {
            requestAnimationFrame(() => {
                map.resize();
                const padding = mobile
                    ? { top: 0, right: 0, bottom: vhToPx(40), left: 0 }
                    : { top: 0, right: 0, bottom: 0, left: remToPx(26.25) };
                map.setPadding(padding);
                map.fitBounds(bounds, {
                    maxZoom: meta.maxZoom,
                    linear: true,
                });
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

        if (isDevMode) {
            map.on('click', (e) => {
                const { lng, lat } = e.lngLat;
                const positions = convertToUnit(meta, lng, lat);
                const marker: TMarkerDev = {
                    map: activeMap,
                    x: positions[0],
                    y: positions[1],
                };
                const markerJson = JSON.stringify(marker, null, 2) + ',';
                console.log(markerJson);
                navigator.clipboard.writeText(markerJson).then();
                new Marker().setLngLat([lng, lat]).addTo(map);
            });
        }

        map.touchZoomRotate.disableRotation();
        map.scrollZoom.enable();
        centreForLayout(wasMobile);
        ro.observe(mapContainer.current);
        setMapInstance(map);

        return () => {
            setOpenPopup(null);
            setMapInstance(null);
            map.remove();
            ro.disconnect();
        };
    }, [setMapInstance, setOpenPopup, isDevMode, mapMetadata, activeMap]);

    return (
        <div className={styles.mapWrapper}>
            {!disclaimerAccepted && isDevMode && (
                <div className={styles.overlay}>
                    <div className={styles.overlayContent}>
                        <>
                            <p>
                                You are viewing the development page (
                                <code>/dev</code>).
                            </p>
                            <p>
                                When clicking on the map, it adds a temporary
                                marker and copies a template into the clipboard
                                for easier data gathering.
                            </p>
                            <div className={styles.buttonGroup}>
                                <button
                                    onClick={() => setDisclaimerAccepted(true)}
                                >
                                    I understand
                                </button>
                                <button
                                    onClick={() => (window.location.href = '/')}
                                >
                                    Take me to safety
                                </button>
                            </div>
                        </>
                    </div>
                </div>
            )}

            <div ref={mapContainer} className={styles.map} />

            {mapInstance && openPopup && (
                <ReactPopup
                    map={mapInstance}
                    lngLat={openPopup.lngLat}
                    isOpen={true}
                >
                    {/* TODO: Replace dummy with real UI */}
                    <div style={{ minWidth: 220, backgroundColor: 'red' }}>
                        <div>
                            <strong>ID:</strong> {openPopup.featureId}
                        </div>
                    </div>
                </ReactPopup>
            )}
        </div>
    );
}
