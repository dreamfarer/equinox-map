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
        markerCountByCategory,
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
        let count = 0;
        for (const cat of activeCategoryList) {
            count += markerCountByCategory[cat] ?? 0;
        }
        setActiveMarkerCount(count);
    }, [
        allMarkers,
        activeCategoryList,
        setActiveMarkerCount,
        markerCountByCategory,
    ]);

    useEffect(() => {
        let count = 0;
        collectedMarkerIds.forEach((id) => {
            allFeatures[id].properties?.categories?.forEach((cat) => {
                if (activeCategoryList.includes(cat as TCategory)) count++;
            });
        });
        setActiveCollectedMarkerCount(count);
    }, [
        collectedMarkerIds,
        allMarkers,
        activeCategoryList,
        setActiveCollectedMarkerCount,
        allFeatures,
    ]);
}
