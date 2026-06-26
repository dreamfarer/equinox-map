'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import type { Map } from 'maplibre-gl';
import type { MapMetadataRecord } from '@/types/map-metadata';

type MapContextValue = {
    mapInstance: Map | null;
    mapContainer: HTMLDivElement | null;
    setMapContainer: (el: HTMLDivElement | null) => void;
    mapMetadata: MapMetadataRecord;
    activeMap: string | null;
    setMapInstance: (map: Map | null) => void;
    setActiveMap: (mapName: string) => void;
};

type MapProviderProps = {
    children: ReactNode;
    mapMetadata: MapMetadataRecord;
};

const MapContext = createContext<MapContextValue | undefined>(undefined);

export function MapProvider({ children, mapMetadata }: MapProviderProps) {
    const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(
        null
    );
    const [mapInstance, setMapInstance] = useState<Map | null>(null);
    const [activeMap, setActiveMap] = useState<string | null>(null);

    const contextValue = useMemo<MapContextValue>(
        () => ({
            mapInstance,
            mapContainer,
            setMapContainer,
            mapMetadata,
            activeMap,
            setMapInstance,
            setActiveMap,
        }),
        [mapInstance, mapContainer, setMapContainer, mapMetadata, activeMap]
    );

    return <MapContext value={contextValue}>{children}</MapContext>;
}

export function useMapContext() {
    const context = useContext(MapContext);
    if (!context)
        throw new Error('useMapContext must be used inside <MapProvider>');
    return context;
}
