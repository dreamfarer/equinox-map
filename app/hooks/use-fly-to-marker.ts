import { useCallback } from 'react';
import { Map } from 'maplibre-gl';
import { ExtendedMap } from '@/types/extended-map';
import { TPopup } from '@/types/popup';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';

export function useFlyToMarker(
  map: Map | null,
  popups: TPopup[],
  markers: TMarkerFeatureCollection | null
) {
  return useCallback(
    (id: string, category?: string) => {
      if (!map || !markers) return;
      const marker = popups.find((m) => m.id === id);
      const feature = markers.features.find((f) => f.properties.id === id);
      if (!marker || !feature) return;
      const [lng, lat] = feature.geometry.coordinates;
      const extendedMap = map as ExtendedMap;
      extendedMap.__requestedCategoryForPopup =
        category ?? Object.keys(marker.categories)[0];
      extendedMap.flyTo({
        center: [lng, lat],
        zoom: 6,
        essential: true,
      });
    },
    [map, popups, markers]
  );
}
