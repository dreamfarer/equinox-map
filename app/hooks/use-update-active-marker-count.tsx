import { useMarkerContext } from '@/app/context/marker-context';
import { useFilterContext } from '@/app/context/filter-context';
import { categories, TCategory } from '@/types/category';
import { useEffect } from 'react';

export function useUpdateActiveMarkerCount() {
    const {
        setActiveMarkerCount,
        setActiveCollectedMarkerCount,
        collectedMarkerIds,
        allMarkers,
        allFeatures,
        allMarkerIdsByCategory,
    } = useMarkerContext();
    const { activeCategoryList } = useFilterContext();

    useEffect(() => {
        if (activeCategoryList.length === 0) {
            setActiveMarkerCount(0);
            return;
        }
        if (activeCategoryList.length === categories.length) {
            setActiveMarkerCount(allMarkers.features.length);
            return;
        }
        const union = new Set<string>();
        for (const cat of activeCategoryList) {
            const set = allMarkerIdsByCategory[cat];
            if (!set) continue;
            for (const id of set) union.add(id);
        }
        setActiveMarkerCount(union.size);
    }, [
        activeCategoryList,
        setActiveMarkerCount,
        allMarkers,
        allMarkerIdsByCategory,
    ]);

    useEffect(() => {
        if (activeCategoryList.length === 0) {
            setActiveCollectedMarkerCount(0);
            return;
        }
        let count = 0;
        const activeSet = new Set(activeCategoryList);
        collectedMarkerIds.forEach((id) => {
            const cats = allFeatures[id]?.properties?.categories ?? [];
            if (cats.some((c) => activeSet.has(c as TCategory))) count += 1;
        });
        setActiveCollectedMarkerCount(count);
    }, [
        collectedMarkerIds,
        activeCategoryList,
        allFeatures,
        setActiveCollectedMarkerCount,
    ]);
}
