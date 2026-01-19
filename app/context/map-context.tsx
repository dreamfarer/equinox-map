'use client';

import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useMemo,
    useState,
} from 'react';
import type { Map } from 'maplibre-gl';
import type { MapMetadataRecord } from '@/types/map-metadata';
import type { TMarkerFeature } from '@/types/marker-feature';

export type OpenPopup = {
    featureId: string;
    lngLat: [number, number];
    feature: TMarkerFeature;
} | null;

type MapContextValue = {
    mapInstance: Map | null;
    mapMetadata: MapMetadataRecord;
    activeMap: string;
    setMapInstance: (map: Map | null) => void;
    setActiveMap: (mapName: string) => void;
    openPopup: OpenPopup;
    setOpenPopup: Dispatch<SetStateAction<OpenPopup>>;
};

type MapProviderProps = {
    children: ReactNode;
    mapMetadata: MapMetadataRecord;
};

const MapContext = createContext<MapContextValue | undefined>(undefined);

export function MapProvider({ children, mapMetadata }: MapProviderProps) {
    const [mapInstance, setMapInstance] = useState<Map | null>(null);
    const [activeMap, setActiveMap] = useState<string>('greenisland');
    const [openPopup, setOpenPopup] = useState<OpenPopup>(null);

    const contextValue = useMemo<MapContextValue>(
        () => ({
            mapInstance,
            mapMetadata,
            activeMap,
            setMapInstance,
            setActiveMap,
            openPopup,
            setOpenPopup,
        }),
        [mapInstance, mapMetadata, activeMap, openPopup]
    );

    return <MapContext value={contextValue}>{children}</MapContext>;
}

export function useMapContext() {
    const context = useContext(MapContext);
    if (!context)
        throw new Error('useMapContext must be used inside <MapProvider>');
    return context;
}
