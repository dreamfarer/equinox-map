'use client';

import { useState } from 'react';
import ReactPopup from '@/app/components/map/react-popup';
import Popup from '@/app/components/map/popup';
import { useDevMode } from '@/app/context/dev-mode-context';
import { useMapContext } from '@/app/context/map-context';
import { useMapLibreMap } from '@/app/hooks/use-map-libre-map';
import { useMapLibreMapEventRegister } from '@/app/hooks/use-map-libre-map-event-register';
import { useMapLibreMapLayerRegister } from '@/app/hooks/use-map-libre-map-layer-register';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from '@/app/components/map.module.css';

export default function Map() {
    const { isDevMode } = useDevMode();
    const { mapInstance, openPopup, mapContainer } = useMapContext();
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

    useMapLibreMap();
    useMapLibreMapLayerRegister();
    useMapLibreMapEventRegister();

    return (
        <div className={styles.mapWrapper}>
            {!disclaimerAccepted && isDevMode && (
                <div className={styles.overlay}>
                    <div className={styles.overlayContent}>
                        <p>
                            You are viewing the development page (
                            <code>/dev</code>).
                        </p>
                        <p>
                            When clicking on the map, it adds a temporary marker
                            and copies a template into the clipboard for easier
                            data gathering.
                        </p>
                        <div className={styles.buttonGroup}>
                            <button onClick={() => setDisclaimerAccepted(true)}>
                                I understand
                            </button>
                            <button
                                onClick={() => (window.location.href = '/')}
                            >
                                Take me to safety
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div ref={mapContainer} className={styles.map} />

            {mapInstance && openPopup && (
                <ReactPopup map={mapInstance} lngLat={openPopup.lngLat} isOpen>
                    <Popup featureId={openPopup.featureId} />
                </ReactPopup>
            )}
        </div>
    );
}
