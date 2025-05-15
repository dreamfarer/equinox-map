'use client';
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Marker } from '../../types/marker';
import styles from './map.module.css';
import { useMarkerLayerContext } from '../context/marker-layer';
import { useDevMode } from '../context/dev-mode';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const isDevMode = useDevMode();
  const { setMapInstance } = useMarkerLayerContext();
  const [tileBaseUrl, setTileBaseUrl] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const exportMarkerDebug = (map: maplibregl.Map, lng: number, lat: number) => {
    const marker: Marker = {
      title: '',
      subtitle: '',
      category: '',
      character: '',
      map: 'greenisland',
      icon: '',
      lng,
      lat,
    };
    const markerJson = JSON.stringify(marker, null, 2) + ',';
    console.log(markerJson);
    navigator.clipboard.writeText(markerJson);
    new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);
  };

  useEffect(() => {
    const testTileUrl = '/tiles/greenisland/0/0/0.png';
    fetch(testTileUrl, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setTileBaseUrl('/tiles/greenisland');
        } else {
          throw new Error('Tile not found locally');
        }
      })
      .catch(() => {
        setTileBaseUrl('https://cdn.equinoxmap.app/greenisland');
      });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || tileBaseUrl === null) return;

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
            bounds: [-180, -71, 39.7, 85],
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
      [-180, -71],
      [39.7, 85],
    ]);
    map.scrollZoom.enable();

    if (isDevMode) {
      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        exportMarkerDebug(map, lng, lat);
      });
    }

    setMapInstance(map);
    return () => map.remove();
  }, [tileBaseUrl, setMapInstance, isDevMode]);

  return (
    <div className={styles.mapWrapper}>
      {!disclaimerAccepted && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            {isDevMode ? (
              <>
                <p>
                  You are viewing the development page (<code>/dev</code>).
                </p>
                <p>
                  When clicking on the map, it adds a temporary marker and
                  copies a template into the clipboard for easier data
                  gathering.
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
            ) : (
              <>
                <p>This interactive map is under active development.</p>
                <p>Bookmark it and check back later! &lt;3</p>
                <div className={styles.buttonGroup}>
                  <button onClick={() => setDisclaimerAccepted(true)}>
                    Continue
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        'https://docs.google.com/forms/d/e/1FAIpQLScLE-dfJ5pjGvxtdScB9KYc0hX9cZI7c1ba80hR33Ceieu2JA/viewform',
                        '_blank',
                      )
                    }
                  >
                    Give Feedback
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <div ref={mapContainer} className={styles.map} />
    </div>
  );
}
