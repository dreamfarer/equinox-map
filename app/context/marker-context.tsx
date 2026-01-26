'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';

type TMarkerContext = {
    allMarkers: TMarkerFeatureCollection;
};

type MarkerProviderProps = {
    children: ReactNode;
    allMarkers: TMarkerFeatureCollection;
};

const MarkerContext = createContext<TMarkerContext | null>(null);

export function MarkerProvider({ children, allMarkers }: MarkerProviderProps) {
    const contextValue = useMemo<TMarkerContext>(
        () => ({
            allMarkers,
        }),
        [allMarkers]
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
