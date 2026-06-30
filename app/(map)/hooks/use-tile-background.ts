'use client';

import { useEffect } from 'react';
import { useMapContext } from '@/app/(map)/context/map-context';

export function useTileBackground() {
    const { activeMapId, mapMetadata } = useMapContext();

    useEffect(() => {
        const color = activeMapId
            ? mapMetadata[activeMapId]?.backgroundColor
            : undefined;
        if (color) {
            document.documentElement.style.setProperty(
                '--tile-background',
                color
            );
        }
    }, [activeMapId, mapMetadata]);
}
