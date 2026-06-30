'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import type { Map } from 'maplibre-gl';
import type { MapMetadataRecord } from '@/types/map-metadata';
import mapMetadata from '@/app/data/maps.json';

type MapContextValue = {
    mapInstance: Map | null;
    mapContainer: HTMLDivElement | null;
    setMapContainer: (el: HTMLDivElement | null) => void;
    mapMetadata: MapMetadataRecord;
    activeMapId: string | null;
    activeMapName: string | null;
    allMapIds: string[];
    allMapNames: string[];
    getMapIdByName: (name: string) => string | undefined;
    setMapInstance: (map: Map | null) => void;
    setActiveMapId: (mapName: string) => void;
    pendingFlyToMarkerId: string | null;
    setPendingFlyToMarkerId: (id: string | null) => void;
};

type MapProviderProps = {
    children: ReactNode;
};

const typedMapMetadata = mapMetadata as MapMetadataRecord;
const allMapIds = Object.keys(typedMapMetadata);
const allMapNames = Object.values(typedMapMetadata).map((m) => m.name);
const nameToId = Object.fromEntries(
    Object.entries(typedMapMetadata).map(([id, meta]) => [meta.name, id])
);
const getMapIdByName = (name: string) => nameToId[name];
const MapContext = createContext<MapContextValue | undefined>(undefined);

export function MapProvider({ children }: MapProviderProps) {
    const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(
        null
    );
    const [mapInstance, setMapInstance] = useState<Map | null>(null);
    const [activeMapId, setActiveMapId] = useState<string | null>(null);
    const [pendingFlyToMarkerId, setPendingFlyToMarkerId] = useState<
        string | null
    >(null);

    const contextValue = useMemo<MapContextValue>(
        () => ({
            mapInstance,
            mapContainer,
            setMapContainer,
            mapMetadata: typedMapMetadata,
            activeMapId,
            activeMapName: activeMapId
                ? (typedMapMetadata[activeMapId]?.name ?? null)
                : null,
            allMapIds,
            allMapNames,
            getMapIdByName,
            setMapInstance,
            setActiveMapId,
            pendingFlyToMarkerId,
            setPendingFlyToMarkerId,
        }),
        [mapInstance, mapContainer, activeMapId, pendingFlyToMarkerId]
    );

    return <MapContext value={contextValue}>{children}</MapContext>;
}

export function useMapContext() {
    const context = useContext(MapContext);
    if (!context)
        throw new Error('useMapContext must be used inside <MapProvider>');
    return context;
}
