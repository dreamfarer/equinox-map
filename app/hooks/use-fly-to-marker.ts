import { MergedMarker } from '@/types/marker';
import { useCallback } from 'react';
import { Map } from 'maplibre-gl';

export function useFlyToMarker(map: Map | null, markers: MergedMarker[]) {
  return useCallback(
    (id: string) => {
      if (!map) return;
      const marker = markers.find((m) => m.id === id);
      if (!marker) return;
      map.flyTo({ center: [marker.lng, marker.lat], zoom: 6 });
    },
    [map, markers]
  );
}
