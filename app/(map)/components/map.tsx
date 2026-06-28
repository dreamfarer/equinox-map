'use client';

import ReactPopup from '@/app/(map)/components/popup/react-popup';
import Popup from '@/app/(map)/components/popup/popup';
import { useMapContext } from '@/app/(map)/context/map-context';
import { useMapLibreMap } from '@/app/(map)/hooks/use-map-libre-map';
import { useMapLibreMapEventRegister } from '@/app/(map)/hooks/use-map-libre-map-event-register';
import { useMapLibreMapLayerRegister } from '@/app/(map)/hooks/use-map-libre-map-layer-register';
import { useMarkerContext } from '@/app/(map)/context/marker-context';
import { useUpdateCollectedMarkers } from '@/app/(map)/hooks/use-update-collected-markers';
import { useMarkerHover } from '@/app/(map)/hooks/use-marker-hover';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from '@/app/(map)/components/map.module.css';
import { useEffect } from 'react';

type Props = {
    initialMap: string;
};

export default function Map({ initialMap }: Props) {
    const { mapInstance, setMapContainer, setActiveMap } = useMapContext();
    const { activePopup } = useMarkerContext();

    useEffect(() => {
        setActiveMap(initialMap);
    }, [initialMap, setActiveMap]);

    useMapLibreMap();
    useMapLibreMapLayerRegister();
    useMapLibreMapEventRegister();
    useUpdateCollectedMarkers();
    useMarkerHover();

    return (
        <div className={styles.fullScreen}>
            <div id="map" ref={setMapContainer} className={styles.fullScreen} />

            {mapInstance && activePopup && (
                <ReactPopup>
                    <Popup />
                </ReactPopup>
            )}
        </div>
    );
}
