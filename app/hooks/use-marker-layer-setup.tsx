'use client';
import { useEffect } from 'react';
import { Map } from 'maplibre-gl';
import { loadIcon } from '@/lib/marker-utility';
import { TMarkerFeatureCollection } from '@/types/marker-feature-collection';
import { TMarkerFeature } from '@/types/marker-feature';

export function useMarkerLayerSetup(
    map: Map | null,
    markers: TMarkerFeatureCollection | null
) {
    useEffect(() => {
        if (!map || !markers) return;

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
                    if (!map.hasImage(icon)) {
                        const img = await loadIcon(
                            map,
                            `/icon/64/${icon}.webp`
                        );
                        map.addImage(icon, img);
                    }
                })
            );

            if (!map.getSource('markers')) {
                map.addSource('markers', {
                    type: 'geojson',
                    data: markers,
                    cluster: false,
                });
            }

            if (!map.getLayer('markers-layer')) {
                map.addLayer({
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

        if (map.isStyleLoaded()) init();
        else map.once('load', init);
    }, [map, markers]);
}
