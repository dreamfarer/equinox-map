'use client';

import {
    createContext,
    ReactNode,
    RefObject,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { Map } from 'maplibre-gl';
import type { MapMetadataRecord } from '@/types/map-metadata';

type MapContextValue = {
    mapInstance: Map | null;
    mapContainer: RefObject<HTMLDivElement | null>;
    mapMetadata: MapMetadataRecord;
    activeMap: string;
    setMapInstance: (map: Map | null) => void;
    setActiveMap: (mapName: string) => void;
};

type MapProviderProps = {
    children: ReactNode;
    mapMetadata: MapMetadataRecord;
};

const MapContext = createContext<MapContextValue | undefined>(undefined);

export function MapProvider({ children, mapMetadata }: MapProviderProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<Map | null>(null);
    const [activeMap, setActiveMap] = useState<string>('greenisland');

    const contextValue = useMemo<MapContextValue>(
        () => ({
            mapInstance,
            mapContainer,
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
