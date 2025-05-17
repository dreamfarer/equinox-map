import { applyFilter } from '@/lib/marker-layer-utility';
import { MarkerCategory } from '@/types/marker';
import { Map } from 'maplibre-gl';
import { useEffect } from 'react';

export function useFilterUpdates(
  map: Map | null,
  enabled: Record<MarkerCategory, boolean>,
  visibleIds: string[] | null,
) {
  useEffect(() => {
    if (!map) return;
    applyFilter(map, enabled, visibleIds);
  }, [map, enabled, visibleIds]);
}
