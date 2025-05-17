'use client';
import { useEffect } from 'react';
import maplibregl, { Map, Offset } from 'maplibre-gl';
import { MarkerFeature, MergedMarker } from '../../types/marker';
import { Popup } from '../components/map/popup';
import { createRoot, Root } from 'react-dom/client';
import { loadIcon, loadMarkers } from '@/lib/marker-layer-utility';

const popupHandlerAttached = new WeakSet<Map>();

export function useMapInitialization(
  map: Map | null,
  setMarkers: (m: MergedMarker[]) => void,
) {
  useEffect(() => {
    if (!map) return;

    const init = async () => {
      const { geojson, flat } = await loadMarkers();
      setMarkers(flat);

      const uniqueIcons = Array.from(
        new Set(flat.map((m) => m.icon?.trim() || 'default-marker')),
      );
      await Promise.all(
        uniqueIcons.map(async (icon) => {
          if (map.hasImage(icon)) return;
          const img = await loadIcon(map, `/icon/64/${icon}.webp`);
          map.addImage(icon, img);
        }),
      );

      if (!map.getSource('markers')) {
        map.addSource('markers', {
          type: 'geojson',
          data: geojson,
          cluster: false,
        });
      }

      if (!map.getLayer('markers-layer')) {
        map.addLayer({
          id: 'markers-layer',
          type: 'symbol',
          source: 'markers',
          layout: {
            'icon-image': ['get', 'icon'],
            'icon-anchor': ['coalesce', ['get', 'anchor'], 'bottom'],
            'icon-allow-overlap': true,
            'icon-size': 0.5,
          },
        });
      }

      if (!popupHandlerAttached.has(map)) {
        popupHandlerAttached.add(map);

        map.on('click', 'markers-layer', (e) => {
          if (!e.features?.length) return;
          const f = e.features[0] as unknown as MarkerFeature;
          const { title, subtitle, anchor } = f.properties;
          const coordinates = f.geometry.coordinates;

          const popup = new maplibregl.Popup({
            closeButton: false,
            className: 'equinox-popup',
          });

          const popupOffset =
            anchor === 'center'
              ? {
                  top: [0, 20],
                  bottom: [0, -20],
                  left: [20, 0],
                  right: [-20, 0],
                  'top-left': [17, 17],
                  'top-right': [-17, 17],
                  'bottom-left': [17, -17],
                  'bottom-right': [-17, -17],
                }
              : {
                  top: [0, 5],
                  bottom: [0, -40],
                  left: [18, -18],
                  right: [-18, -18],
                  'top-left': [12, 0],
                  'top-right': [-12, 0],
                  'bottom-left': [14, -32],
                  'bottom-right': [-14, -32],
                };
          popup.setOffset(popupOffset as Offset);

          const container = document.createElement('div');
          const root: Root = createRoot(container);
          root.render(
            <Popup
              title={title}
              subtitle={subtitle}
              onClose={() => {
                popup.remove();
                root.unmount();
              }}
            />,
          );

          popup.setDOMContent(container).setLngLat(coordinates).addTo(map);
        });
      }
    };

    if (map.isStyleLoaded()) init();
    else map.once('load', init);
  }, [map, setMarkers]);
}
