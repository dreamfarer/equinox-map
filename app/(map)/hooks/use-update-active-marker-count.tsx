'use client';

import { useMarkerContext } from '@/app/(map)/context/marker-context';
import { useFilterContext } from '@/app/(map)/context/filter-context';
import { useMapContext } from '@/app/(map)/context/map-context';
import { categories, TCategory } from '@/types/category';
import { useEffect } from 'react';

export function useUpdateActiveMarkerCount() {
    const {
        setActiveMarkerCount,
        setActiveCollectedMarkerCount,
        collectedMarkerIds,
        allFeatures,
        allMarkerIdsByCategoryAndMap,
        allMarkerCountByMap,
    } = useMarkerContext();
    const { activeCategoryList } = useFilterContext();
    const { activeMapId } = useMapContext();

    useEffect(() => {
        if (!activeMapId || activeCategoryList.length === 0) {
            setActiveMarkerCount(0);
            return;
        }
        if (activeCategoryList.length === categories.length) {
            setActiveMarkerCount(allMarkerCountByMap[activeMapId] ?? 0);
            return;
        }
        const mapCategoryIds = allMarkerIdsByCategoryAndMap[activeMapId] ?? {};
        const union = new Set<string>();
        for (const cat of activeCategoryList) {
            for (const id of mapCategoryIds[cat] ?? []) union.add(id);
        }
        setActiveMarkerCount(union.size);
    }, [
        activeMapId,
        activeCategoryList,
        setActiveMarkerCount,
        allMarkerIdsByCategoryAndMap,
        allMarkerCountByMap,
    ]);

    useEffect(() => {
        if (!activeMapId || activeCategoryList.length === 0) {
            setActiveCollectedMarkerCount(0);
            return;
        }
        let count = 0;
        const activeSet = new Set(activeCategoryList);
        collectedMarkerIds.forEach((id) => {
            const props = allFeatures[id]?.properties;
            if (!props || props.map !== activeMapId) return;
            const cats = props.categories ?? [];
            if (cats.some((c) => activeSet.has(c as TCategory))) count += 1;
        });
        setActiveCollectedMarkerCount(count);
    }, [
        activeMapId,
        collectedMarkerIds,
        activeCategoryList,
        allFeatures,
        setActiveCollectedMarkerCount,
    ]);
}
