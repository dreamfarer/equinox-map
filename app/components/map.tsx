'use client';
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Marker } from '../types/marker';
import styles from './map.module.css';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [tileBaseUrl, setTileBaseUrl] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const exportMarkerDebug = (map: maplibregl.Map, lng: number, lat: number) => {
    const marker: Marker = {
      title: '',
      subtitle: '',
      type: '',
      character: '',
      map: 'greenisland',
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

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      exportMarkerDebug(map, lng, lat);
    });

    return () => map.remove();
  }, [tileBaseUrl]);

  return (
    <div className={styles.mapWrapper}>
      {!disclaimerAccepted && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <p>
              This interactive map is under active development. Most features
              are not implemented yet.
            </p>
            <p>Bookmark it and check back later! &lt;3</p>
            <button onClick={() => setDisclaimerAccepted(true)}>
              I understand
            </button>
          </div>
        </div>
      )}
      <div ref={mapContainer} className={styles.map} />
    </div>
  );
}
