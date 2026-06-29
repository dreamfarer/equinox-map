'use client';

import { useEffect } from 'react';
import { GeoJSON } from 'geojson';
import { loadIcon } from '@/lib/marker-utility';
import { TMarkerFeature } from '@/types/marker-feature';
import { useMapContext } from '@/app/(map)/context/map-context';
import { useMarkerContext } from '@/app/(map)/context/marker-context';
import { useMarkerFilter } from '@/app/(map)/hooks/use-marker-filter';

export function useMapLibreMapLayerRegister() {
    const { mapInstance } = useMapContext();
    const { allMarkers } = useMarkerContext();
    const mapLibreFilterExpression = useMarkerFilter();

    useEffect(() => {
        if (!mapInstance || !allMarkers) return;

        const init = async () => {
            const uniqueIcons: string[] = Array.from(
                new Set(
                    (allMarkers.features as TMarkerFeature[]).map(
                        (f) => f.properties.icon?.trim() || 'default-marker'
                    )
                )
            );

            await Promise.all(
                uniqueIcons.map(async (icon) => {
                    if (!mapInstance.hasImage(icon)) {
                        const img = await loadIcon(
                            mapInstance,
                            `https://cdn.equinoxmap.app/icon/64/${icon}.webp`
                        );
                        mapInstance.addImage(icon, img);
                    }
                })
            );

            if (!mapInstance.getSource('markers')) {
                mapInstance.addSource('markers', {
                    type: 'geojson',
                    data: allMarkers as GeoJSON,
                    cluster: false,
                    promoteId: 'id',
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
                        'icon-overlap': 'always',
                        'icon-size': 0.5,
                        'symbol-z-order': 'source',
                        'symbol-sort-key': 0,
                    },
                    paint: {
                        'icon-opacity': [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false],
                            0,
                            [
                                'case',
                                ['boolean', ['feature-state', 'dim'], false],
                                0.5,
                                1.0,
                            ],
                        ],
                        'icon-opacity-transition': {
                            duration: 1200,
                            delay: 0,
                        },
                    },
                });
            }

            if (!mapInstance.getLayer('markers-hover-layer')) {
                mapInstance.addLayer({
                    id: 'markers-hover-layer',
                    type: 'symbol',
                    source: 'markers',
                    layout: {
                        'icon-image': ['get', 'icon'],
                        'icon-anchor': [
                            'coalesce',
                            ['get', 'anchor'],
                            'bottom',
                        ],
                        'icon-overlap': 'always',
                        'icon-size': 0.65,
                        'symbol-z-order': 'source',
                        'symbol-sort-key': 1,
                    },
                    paint: {
                        'icon-opacity': [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false],
                            [
                                'case',
                                ['boolean', ['feature-state', 'dim'], false],
                                0.5,
                                1.0,
                            ],
                            0,
                        ],
                        'icon-opacity-transition': {
                            duration: 1200,
                            delay: 0,
                        },
                    },
                });
            }

            mapInstance.setFilter('markers-layer', mapLibreFilterExpression);
            mapInstance.setFilter(
                'markers-hover-layer',
                mapLibreFilterExpression
            );
        };

        if (!mapInstance.style) return;
        if (mapInstance.isStyleLoaded()) init().then();
        else mapInstance.once('load', init);

        return () => {
            mapInstance.off('load', init);
        };
    }, [mapInstance, allMarkers, mapLibreFilterExpression]);

    useEffect(() => {
        if (!mapInstance) return;
        const applyFilterIfReady = () => {
            if (
                mapInstance.style &&
                mapInstance.isStyleLoaded() &&
                mapInstance.getLayer('markers-layer') &&
                mapInstance.getLayer('markers-hover-layer')
            ) {
                mapInstance.setFilter(
                    'markers-layer',
                    mapLibreFilterExpression
                );
                mapInstance.setFilter(
                    'markers-hover-layer',
                    mapLibreFilterExpression
                );
                mapInstance.off('styledata', applyFilterIfReady);
            }
        };
        applyFilterIfReady();
        mapInstance.on('styledata', applyFilterIfReady);
        return () => {
            mapInstance.off('styledata', applyFilterIfReady);
        };
    }, [mapInstance, mapLibreFilterExpression]);
}
