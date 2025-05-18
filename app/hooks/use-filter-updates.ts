import { applyFilter } from '@/lib/marker-layer-utility';
import { MarkerCategory, MergedMarker } from '@/types/marker';
import { Map } from 'maplibre-gl';
import { useEffect } from 'react';

export function useFilterUpdates(
  map: Map | null,
  enabled: Record<MarkerCategory, boolean>,
  visibleIds: string[] | null,
  markers: MergedMarker[],
) {
  useEffect(() => {
    if (!map) return;
    requestAnimationFrame(() => {
      applyFilter(map, enabled, visibleIds, markers);
    });
  }, [map, enabled, visibleIds, markers]);
}
