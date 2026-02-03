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
    allPopups: Popups;
    allMarkers: TMarkerFeatureCollection;
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
    const [collectedMarkerIds, setCollectedMarkerIds] = useState<Set<string>>(
        () => loadCollectedMarkerIdsFromLocalStorage(allMarkers)
    );

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
            allPopups,
            allMarkers,
        }),
        [
            activePopup,
            setActivePopupByFeature,
            collectedMarkerIds,
            allPopups,
            allMarkers,
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
