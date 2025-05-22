'use client';
import { useEffect } from 'react';
import { Map } from 'maplibre-gl';
import { loadData, loadIcon } from '@/lib/marker-layer-utility';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { TPopups } from '@/types/popup';
import { TMarkerFeature } from '@/types/marker-feature';

export function useMapInitialization(
  map: Map | null,
  setPopups: (p: TPopups) => void,
  setGeojson: (g: TMarkerFeatureCollection) => void
) {
  useEffect(() => {
    if (!map) return;

    const init = async () => {
      const { markers, popups } = await loadData();
      setGeojson(markers);
      setPopups(popups);

      const uniqueIcons: string[] = Array.from(
        new Set(
          (markers.features as TMarkerFeature[]).map(
            (f) => f.properties.icon?.trim() || 'default-marker'
          )
        )
      );

      await Promise.all(
        uniqueIcons.map(async (icon) => {
          if (!map.hasImage(icon)) {
            const img = await loadIcon(map, `/icon/64/${icon}.webp`);
            map.addImage(icon, img);
          }
        })
      );

      if (!map.getSource('markers')) {
        map.addSource('markers', {
          type: 'geojson',
          data: markers,
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
    };

    if (map.isStyleLoaded()) init();
    else map.once('load', init);
  }, [map, setPopups, setGeojson]);
}
