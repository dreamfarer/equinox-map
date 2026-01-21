'use client';

import {
    createContext,
    useContext,
    useState,
    useMemo,
    useEffect,
    ReactNode,
} from 'react';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { loadMarkers } from '@/lib/marker-utility';

type TMarkerContext = {
    markers: TMarkerFeatureCollection | null;
};

const MarkerContext = createContext<TMarkerContext | null>(null);

export function MarkerProvider({ children }: { children: ReactNode }) {
    const [markers, setMarkers] = useState<TMarkerFeatureCollection | null>(
        null
    );

    useEffect(() => {
        const load = async () => {
            setMarkers(await loadMarkers());
        };
        load();
    }, []);

    const contextValue = useMemo<TMarkerContext>(
        () => ({
            markers,
        }),
        [markers]
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
