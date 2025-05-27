'use client';
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './map.module.css';
import { useMarkerLayerContext } from '../context/marker-layer';
import { useDevMode } from '../context/dev-mode';
import { TMarkerDev } from '@/types/marker-dev';
import { convertToUnit, getMapBoundsLatLng } from '@/lib/convert';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const isDevMode = useDevMode();
  const { setMapInstance, maps } = useMarkerLayerContext();
  const [tileBaseUrl, setTileBaseUrl] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const exportMarkerDebug = (
    map: maplibregl.Map,
    lng: number,
    lat: number,
    x: number,
    y: number
  ) => {
    const marker: TMarkerDev = {
      map: 'greenisland',
      x,
      y,
    };
    const markerJson = JSON.stringify(marker, null, 2) + ',';
    console.log(markerJson);
    navigator.clipboard.writeText(markerJson);
    new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);
  };

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      setTileBaseUrl('/tiles/greenisland');
    } else {
      setTileBaseUrl('https://cdn.equinoxmap.app/greenisland');
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || tileBaseUrl === null || !maps?.greenisland)
      return;
    const bounds = getMapBoundsLatLng(maps.greenisland);

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          gameMap: {
            type: 'raster',
            tiles: [`${tileBaseUrl}/{z}/{y}/{x}.png`],
            tileSize: 256,
            scheme: 'xyz',
            maxzoom: 5,
            bounds,
            attribution: 'Blue Scarab Entertainment',
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
      center: [0, 0],
      zoom: 2,
      minZoom: 0,
      maxZoom: 6,
      interactive: true,
      bearingSnap: 0,
      pitchWithRotate: false,
      dragRotate: false,
      transformRequest: (url) => ({ url }),
    });

    map.touchZoomRotate.disableRotation();
    map.setMaxBounds([
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]],
    ]);
    map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      {
        padding: 20,
        linear: true,
        maxZoom: 5,
      }
    );
    map.scrollZoom.enable();

    if (isDevMode) {
      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        const positions = convertToUnit(maps.greenisland, lng, lat);
        exportMarkerDebug(map, lng, lat, positions[0], positions[1]);
      });
    }

    setMapInstance(map);
    return () => map.remove();
  }, [tileBaseUrl, setMapInstance, isDevMode, maps]);

  return (
    <div className={styles.mapWrapper}>
      {!disclaimerAccepted && isDevMode && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <>
              <p>
                You are viewing the development page (<code>/dev</code>).
              </p>
              <p>
                When clicking on the map, it adds a temporary marker and copies
                a template into the clipboard for easier data gathering.
              </p>
              <div className={styles.buttonGroup}>
                <button onClick={() => setDisclaimerAccepted(true)}>
                  I understand
                </button>
                <button onClick={() => (window.location.href = '/')}>
                  Take me to safety
                </button>
              </div>
            </>
          </div>
        </div>
      )}
      <div ref={mapContainer} className={styles.map} />
    </div>
  );
}
