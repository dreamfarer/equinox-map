import { useCallback, useState } from 'react';
import { Map } from 'maplibre-gl';

export function useMapInstance(): [Map | null, (m: Map) => void] {
  const [map, setMap] = useState<Map | null>(null);
  const setMapInstance = useCallback((m: Map) => setMap(m), []);
  return [map, setMapInstance];
}
