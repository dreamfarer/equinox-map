'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useMapInstance } from '../hooks/use-map';
import { loadMapMetadata } from '@/lib/map-utility';
import { TMapContext } from '@/types/map-context';
import { MapMetadataRecord } from '@/types/map-metadata';

const MapContext = createContext<TMapContext | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const { mapInstance, setMapInstance } = useMapInstance();
  const [mapMetadata, setMapMetadata] = useState<MapMetadataRecord | null>(
    null
  );

  useEffect(() => {
    const load = async () => {
      setMapMetadata(await loadMapMetadata());
    };
    load();
  }, []);

  const contextValue = useMemo<TMapContext>(
    () => ({
      mapInstance,
      mapMetadata,
      setMapInstance,
    }),
    [mapInstance, mapMetadata, setMapInstance]
  );

  return (
    <MapContext.Provider value={contextValue}>{children}</MapContext.Provider>
  );
}
export function useMapContext() {
  const context = useContext(MapContext);
  if (!context)
    throw new Error('useMapContext must be used inside MapProvider');
  return context;
}
