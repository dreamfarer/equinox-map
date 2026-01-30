'use client';

import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import { TCategoryPayloads, TPopups } from '@/types/popup';
import { TMarkerFeature } from '@/types/marker-feature';
import { calculatePopupOffset } from '@/lib/popup-utility';

type ActivePopup = {
    featureId: string;
    lngLat: [number, number];
    offset: Record<string, [number, number]>;
    content: TCategoryPayloads;
};

type PopupContextValue = {
    activePopup: ActivePopup | null;
    allPopups: TPopups;
    setActivePopupByFeature: (feature: TMarkerFeature | null) => void;
};

const PopupContext = createContext<PopupContextValue | undefined>(undefined);

type PopupProviderProps = {
    children: ReactNode;
    allPopups: TPopups;
};

export function PopupProvider({ children, allPopups }: PopupProviderProps) {
    const [activePopup, setActivePopup] = useState<ActivePopup | null>(null);

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

    const value = useMemo(
        () => ({
            activePopup,
            allPopups,
            setActivePopupByFeature,
        }),
        [activePopup, allPopups, setActivePopupByFeature]
    );

    return <PopupContext value={value}>{children}</PopupContext>;
}

export function usePopupContext() {
    const context = useContext(PopupContext);
    if (!context)
        throw new Error('usePopupContext must be used inside <PopupProvider>');
    return context;
}
