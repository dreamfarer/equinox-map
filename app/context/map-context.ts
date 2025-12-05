'use client';

import { createContext, useContext } from 'react';
import { Map } from 'maplibre-gl';
import { MapMetadataRecord } from '@/types/map-metadata';

type TMapContext = {
  mapInstance: Map | null;
  mapMetadata: MapMetadataRecord;
  activeMap: string;
  setMapInstance: (map: Map) => void;
  setActiveMap: (mapName: string) => void;
};

/**
 * Context for managing the map
 */
export const MapContext = createContext<TMapContext | null>(null);
export function useMapContext() {
  const context = useContext(MapContext);
  if (!context)
    throw new Error('useMapContext must be used inside <MapContextProvider>');
  return context;
}
