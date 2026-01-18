'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import type { MapMetadataRecord } from '@/types/map-metadata';
import type { Map } from 'maplibre-gl';

type MapContextValue = {
    mapInstance: Map | null;
    mapMetadata: MapMetadataRecord;
    activeMap: string;
    setMapInstance: (map: Map) => void;
    setActiveMap: (mapName: string) => void;
};

type MapProviderProps = {
    children: ReactNode;
    mapMetadata: MapMetadataRecord;
};

const MapContext = createContext<MapContextValue | undefined>(undefined);

export function MapProvider({ children, mapMetadata }: MapProviderProps) {
    const [mapInstance, setMapInstance] = useState<Map | null>(null);
    const [activeMap, setActiveMap] = useState<string>('greenisland');

    const contextValue = useMemo<MapContextValue>(
        () => ({
            mapInstance,
            mapMetadata,
            activeMap,
            setMapInstance,
            setActiveMap,
        }),
        [mapInstance, mapMetadata, activeMap]
    );

    return <MapContext value={contextValue}>{children}</MapContext>;
}

export function useMapContext() {
    const context = useContext(MapContext);
    if (!context)
        throw new Error('useMapContext must be used inside <MapProvider>');
    return context;
}
