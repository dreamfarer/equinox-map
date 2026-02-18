'use client';

import {
    createContext,
    useContext,
    useMemo,
    ReactNode,
    useState,
    useCallback,
    Dispatch,
    SetStateAction,
    useEffect,
} from 'react';
import { CategoryPayloads, Popups } from '@/types/popup';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { TMarkerFeature } from '@/types/marker-feature';
import { calculatePopupOffset } from '@/lib/popup-utility';
import { loadCollectedMarkerIdsFromLocalStorage } from '@/lib/storage-utility';

type ActivePopup = {
    featureId: string;
    lngLat: [number, number];
    offset: Record<string, [number, number]>;
    content: CategoryPayloads;
};

type MarkerContextValue = {
    activePopup: ActivePopup | null;
    setActivePopupByFeature: (feature: TMarkerFeature | null) => void;
    collectedMarkerIds: Set<string>;
    setCollectedMarkerIds: Dispatch<SetStateAction<Set<string>>>;
    activeMarkerCount: number;
    setActiveMarkerCount: Dispatch<SetStateAction<number>>;
    activeCollectedMarkerCount: number;
    setActiveCollectedMarkerCount: Dispatch<SetStateAction<number>>;
    allPopups: Popups;
    allMarkers: TMarkerFeatureCollection;
    allFeatures: Record<string, TMarkerFeature>;
    markerCountByCategory: Record<string, number>;
};

type MarkerProviderProps = {
    children: ReactNode;
    allPopups: Popups;
    allMarkers: TMarkerFeatureCollection;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

export function MarkerProvider({
    children,
    allPopups,
    allMarkers,
}: Readonly<MarkerProviderProps>) {
    const [activePopup, setActivePopup] = useState<ActivePopup | null>(null);
    const [activeMarkerCount, setActiveMarkerCount] = useState(0);
    const [activeCollectedMarkerCount, setActiveCollectedMarkerCount] =
        useState(0);
    const [collectedMarkerIds, setCollectedMarkerIds] = useState<Set<string>>(
        new Set<string>()
    );

    const allFeatures = useMemo(() => {
        const map = {} as Record<string, TMarkerFeature>;
        allMarkers.features.forEach((feature) => {
            map[feature.properties.id] = feature;
        });
        return map;
    }, [allMarkers]);

    const markerCountByCategory = useMemo(() => {
        const map = {} as Record<string, number>;
        allMarkers.features.forEach((feature) => {
            feature.properties.categories?.forEach((cat) => {
                map[cat] = (map[cat] ?? 0) + 1;
            });
        });
        return map;
    }, [allMarkers]);

    useEffect(() => {
        setCollectedMarkerIds(
            loadCollectedMarkerIdsFromLocalStorage(allMarkers)
        );
    }, [allMarkers]);

    const setActivePopupByFeature = useCallback(
        (feature: TMarkerFeature | null) => {
            if (!feature) {
                setActivePopup(null);
                return;
            }
            const featureId = feature.properties.id;
            setActivePopup({
                featureId,
                lngLat: feature.geometry.coordinates as [number, number],
                offset: calculatePopupOffset(feature.properties.anchor),
                content: allPopups[featureId],
            });
        },
        [allPopups]
    );

    const contextValue = useMemo<MarkerContextValue>(
        () => ({
            activePopup,
            setActivePopupByFeature,
            collectedMarkerIds,
            setCollectedMarkerIds,
            activeMarkerCount,
            setActiveMarkerCount,
            activeCollectedMarkerCount,
            setActiveCollectedMarkerCount,
            allPopups,
            allMarkers,
            allFeatures,
            markerCountByCategory,
        }),
        [
            activePopup,
            setActivePopupByFeature,
            collectedMarkerIds,
            activeMarkerCount,
            activeCollectedMarkerCount,
            allPopups,
            allMarkers,
            allFeatures,
            markerCountByCategory,
        ]
    );

    return <MarkerContext value={contextValue}>{children}</MarkerContext>;
}

export function useMarkerContext() {
    const context = useContext(MarkerContext);
    if (!context)
        throw new Error(
            'useMarkerContext must be used inside <MarkerProvider>'
        );
    return context;
}
