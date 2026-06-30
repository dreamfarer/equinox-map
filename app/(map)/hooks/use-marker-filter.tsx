'use client';

import { useMemo } from 'react';
import { ExpressionSpecification } from 'maplibre-gl';
import { categories } from '@/types/category';
import { useFilterContext } from '@/app/(map)/context/filter-context';
import { useMapContext } from '@/app/(map)/context/map-context';

export function useMarkerFilter(): ExpressionSpecification {
    const { activeCategoryList } = useFilterContext();
    const { activeMapId } = useMapContext();

    return useMemo<ExpressionSpecification>(() => {
        if (!activeMapId) return ['boolean', false];

        const mapFilter: ExpressionSpecification = [
            '==',
            ['get', 'map'],
            activeMapId,
        ];

        if (activeCategoryList.length === 0) {
            return ['all', mapFilter, ['boolean', false]];
        }

        if (activeCategoryList.length === categories.length) {
            return mapFilter;
        }

        const categoryFilter: ExpressionSpecification = [
            'any',
            ...activeCategoryList.map(
                (cat) =>
                    [
                        'in',
                        cat,
                        ['get', 'categories'],
                    ] as ExpressionSpecification
            ),
        ];

        return ['all', mapFilter, categoryFilter];
    }, [activeMapId, activeCategoryList]);
}
