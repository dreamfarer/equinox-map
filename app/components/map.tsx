'use client';

import ReactPopup from '@/app/components/map/react-popup';
import Popup from '@/app/components/map/popup';
import { useMapContext } from '@/app/context/map-context';
import { useMapLibreMap } from '@/app/hooks/use-map-libre-map';
import { useMapLibreMapEventRegister } from '@/app/hooks/use-map-libre-map-event-register';
import { useMapLibreMapLayerRegister } from '@/app/hooks/use-map-libre-map-layer-register';
import { useMarkerContext } from '@/app/context/marker-context';
import { useUpdateCollectedMarkers } from '@/app/hooks/use-update-collected-markers';
import { useMarkerHover } from '@/app/hooks/use-marker-hover';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from '@/app/components/map.module.css';

export default function Map() {
    const { mapInstance, mapContainer } = useMapContext();
    const { activePopup } = useMarkerContext();

    useMapLibreMap();
    useMapLibreMapLayerRegister();
    useMapLibreMapEventRegister();
    useUpdateCollectedMarkers();
    useMarkerHover();

    return (
        <div className={styles.mapWrapper}>
            <div ref={mapContainer} className={styles.map} id="map" />

            {mapInstance && activePopup && (
                <ReactPopup>
                    <Popup />
                </ReactPopup>
            )}
        </div>
    );
}
