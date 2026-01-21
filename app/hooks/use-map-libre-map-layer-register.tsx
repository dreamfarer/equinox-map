'use client';

import { useEffect } from 'react';
import { loadIcon } from '@/lib/marker-utility';
import { TMarkerFeature } from '@/types/marker-feature';
import { useMapContext } from '@/app/context/map-context';
import { useMarkerContext } from '@/app/context/marker-context';
import { useFilterContext } from '@/app/context/filter-context';

export function useMapLibreMapLayerRegister() {
    const { mapInstance } = useMapContext();
    const { markers } = useMarkerContext();
    const { mapLibreFilterExpression } = useFilterContext();

    useEffect(() => {
        if (!mapInstance || !markers) return;

        const init = async () => {
            const uniqueIcons: string[] = Array.from(
                new Set(
                    (markers.features as TMarkerFeature[]).map(
                        (f) => f.properties.icon?.trim() || 'default-marker'
                    )
                )
            );

            await Promise.all(
                uniqueIcons.map(async (icon) => {
                    if (!mapInstance.hasImage(icon)) {
                        const img = await loadIcon(
                            mapInstance,
                            `/icon/64/${icon}.webp`
                        );
                        mapInstance.addImage(icon, img);
                    }
                })
            );

            if (!mapInstance.getSource('markers')) {
                mapInstance.addSource('markers', {
                    type: 'geojson',
                    data: markers,
                    cluster: false,
                });
            }

            if (!mapInstance.getLayer('markers-layer')) {
                mapInstance.addLayer({
                    id: 'markers-layer',
                    type: 'symbol',
                    source: 'markers',
                    layout: {
                        'icon-image': ['get', 'icon'],
                        'icon-anchor': [
                            'coalesce',
                            ['get', 'anchor'],
                            'bottom',
                        ],
                        'icon-allow-overlap': true,
                        'icon-size': 0.5,
                    },
                });
            }
        };

        if (mapInstance.isStyleLoaded()) init().then();
        else mapInstance.once('load', init);
    }, [mapInstance, markers]);

    useEffect(() => {
        if (!mapInstance) return;

        const applyFilter = () => {
            if (!mapInstance.getLayer('markers-layer')) return;
            mapInstance.setFilter('markers-layer', mapLibreFilterExpression);
        };

        if (mapInstance.isStyleLoaded()) applyFilter();
        else {
            mapInstance.once('load', applyFilter);
        }
    }, [mapInstance, mapLibreFilterExpression]);
}
