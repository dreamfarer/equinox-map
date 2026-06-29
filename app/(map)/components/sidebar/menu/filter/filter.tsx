'use client';

import { useCallback, useMemo, useState } from 'react';
import Category from '@/app/(map)/components/sidebar/menu/filter/category/category';
import Searchbar from '@/app/(shared)/components/searchbar/searchbar';
import { useMarkerContext } from '@/app/(map)/context/marker-context';
import { categoryGroups } from '@/app/(map)/components/sidebar/menu/filter/config';
import Results from '@/app/(map)/components/sidebar/menu/filter/search-results/results';
import MarkerCollectionDisplay from '@/app/(map)/components/sidebar/menu/filter/marker-collection-display/marker-collection-display';
import { useFilterContext } from '@/app/(map)/context/filter-context';
import styles from '@/app/(map)/components/sidebar/menu/filter/filter.module.css';
import { useUpdateActiveMarkerCount } from '@/app/(map)/hooks/use-update-active-marker-count';
import { useMapContext } from '@/app/(map)/context/map-context';

type MarkerSearchResult = {
    markerId: string;
    categoryId: string;
    itemId: string;
    title: string;
    subtitle?: string;
};

export default function Filter() {
    const { allPopups, collectedMarkerIds, setCollectedMarkerIds } =
        useMarkerContext();
    const {
        activeCategories,
        activeCategoryList,
        setActiveCategories,
        toggleActiveCategory,
        setAllCategories,
        getCategoriesForMap,
    } = useFilterContext();
    const { activeMapId } = useMapContext();
    const [query, setQuery] = useState('');

    useUpdateActiveMarkerCount();

    const mapCategorySet = useMemo(
        () => new Set(getCategoriesForMap(activeMapId ?? '')),
        [activeMapId, getCategoriesForMap]
    );

    const results = useMemo((): MarkerSearchResult[] => {
        if (!query.trim()) return [];

        const q = query.toLowerCase();
        const matches: MarkerSearchResult[] = [];

        for (const [markerId, categories] of Object.entries(allPopups)) {
            for (const [categoryId, items] of Object.entries(categories)) {
                for (const [itemId, item] of Object.entries(items)) {
                    const text =
                        `${item.title ?? ''} ${item.subtitle ?? ''}`.toLowerCase();
                    if (text.includes(q)) {
                        matches.push({
                            markerId,
                            categoryId,
                            itemId,
                            title: item.title,
                            subtitle: item.subtitle,
                        });
                    }
                }
            }
        }

        return matches;
    }, [query, allPopups]);

    const mapActiveCategoryCount = useMemo(
        () =>
            activeCategoryList.filter((cat) => mapCategorySet.has(cat)).length,
        [activeCategoryList, mapCategorySet]
    );

    const toggleAllCategories = useCallback(() => {
        if (mapActiveCategoryCount < mapCategorySet.size)
            return setAllCategories(true);
        return setAllCategories(false);
    }, [mapActiveCategoryCount, mapCategorySet.size, setAllCategories]);

    const toggleAllCategoriesText = useMemo(() => {
        return mapActiveCategoryCount < mapCategorySet.size
            ? 'Show All Markers'
            : 'Hide All Markers';
    }, [mapActiveCategoryCount, mapCategorySet.size]);

    const showResetCollectionButton = useMemo(() => {
        return collectedMarkerIds.size > 0;
    }, [collectedMarkerIds]);

    const resetCollection = useCallback(() => {
        setCollectedMarkerIds(new Set([]));
    }, [setCollectedMarkerIds]);

    return (
        <>
            <Searchbar onSearchAction={setQuery} />
            <MarkerCollectionDisplay></MarkerCollectionDisplay>
            <div
                className={`${styles.buttonGroupHorizontal} ${!showResetCollectionButton && styles.noGap}`}
                id="buttonGroupHorizontal"
            >
                <button
                    className={`outline ${styles.button}`}
                    onClick={toggleAllCategories}
                    id="toggleAllCategories"
                >
                    {toggleAllCategoriesText}
                </button>
                <button
                    className={`outline ${styles.button} ${!showResetCollectionButton && styles.hidden}`}
                    onClick={resetCollection}
                >
                    Reset Collection
                </button>
            </div>
            {!query.trim() &&
                categoryGroups.map((group) => {
                    const filteredEntries = group.entries.filter(({ id }) =>
                        mapCategorySet.has(id)
                    );
                    if (filteredEntries.length === 0) return null;

                    const anyActive = filteredEntries.some(
                        ({ id }) => activeCategories[id]
                    );
                    const allActive = filteredEntries.every(
                        ({ id }) => activeCategories[id]
                    );

                    const toggleAll = () => {
                        setActiveCategories((prev) => {
                            const next = { ...prev };
                            const nextValue = !allActive;
                            group.entries.forEach(
                                (entry) => (next[entry.id] = nextValue)
                            );
                            return next;
                        });
                    };

                    const entries = filteredEntries.map(({ label, id }) => ({
                        label,
                        isActive: !!activeCategories[id],
                        onToggle: () => toggleActiveCategory(id),
                    }));

                    return (
                        <Category
                            key={group.title}
                            title={group.title}
                            isActive={anyActive}
                            onToggle={toggleAll}
                            entries={entries}
                        />
                    );
                })}
            {query &&
                (results.length === 0 ? (
                    <p>No matches. (´•︵•`)</p>
                ) : (
                    <Results results={results} />
                ))}
        </>
    );
}
