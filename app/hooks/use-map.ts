import { useState } from 'react';
import { Map } from 'maplibre-gl';

export function useMapInstance() {
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  return { mapInstance, setMapInstance };
}
