'use client';

import { ReactNode, useMemo, useState } from 'react';
import { Map } from 'maplibre-gl';
import { MapMetadataRecord } from '@/types/map-metadata';
import { MapContext } from '@/app/context/map-context';

/**
 * Context provider for managing the map
 */
export function MapContextProvider({
  children,
  mapMetadata: serverMapMetadata,
}: {
  children: ReactNode;
  mapMetadata: MapMetadataRecord;
}) {
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [activeMap, setActiveMap] = useState<string>('greenisland');
  const [mapMetadata, setMapMetadata] =
    useState<MapMetadataRecord>(serverMapMetadata);

  const value = useMemo(
    () => ({
      mapInstance,
      mapMetadata,
      activeMap,
      setMapInstance,
      setActiveMap,
      setMapMetadata,
    }),
    [mapInstance, mapMetadata, activeMap]
  );

  return <MapContext value={value}>{children}</MapContext>;
}
