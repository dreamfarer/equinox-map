'use client';

import type { NextPage } from 'next';
import { useCallback, useMemo, useState } from 'react';
import Category from '@/app/components/filter/category';
import Searchbar from '@/app/components/filter/searchbar';
import { useMarkerContext } from '@/app/context/marker-context';
import { categoryGroups } from '@/app/components/filter/config';
import Results from '@/app/components/filter/results';
import Menu from '@/app/components/menu';
import MarkerCollectionDisplay from '@/app/components/marker-collection-display';
import { useFlyToMarker } from '@/app/hooks/use-fly-to-marker';
import { useMapContext } from '@/app/context/map-context';
import { useFilterContext } from '@/app/context/filter-context';
import styles from '@/app/components/filter.module.css';
import { useUpdateActiveMarkerCount } from '@/app/hooks/use-update-active-marker-count';

type MarkerSearchResult = {
    markerId: string;
    categoryId: string;
    itemId: string;
    title: string;
    subtitle?: string;
};

const Filter: NextPage = () => {
    const { mapInstance } = useMapContext();
    const { allMarkers, allPopups, collectedMarkerIds, setCollectedMarkerIds } =
        useMarkerContext();
    const {
        activeCategories,
        activeCategoryList,
        allCategories,
        setActiveCategories,
        toggleActiveCategory,
        setAllCategories,
    } = useFilterContext();
    const flyToMarker = useFlyToMarker(mapInstance, allPopups, allMarkers);
    const [query, setQuery] = useState('');

    useUpdateActiveMarkerCount();

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

    const toggleAllCategories = useCallback(() => {
        if (activeCategoryList.length < allCategories.length)
            return setAllCategories(true);
        return setAllCategories(false);
    }, [activeCategoryList.length, allCategories.length, setAllCategories]);

    const toggleAllCategoriesText = useMemo(() => {
        return activeCategoryList.length < allCategories.length
            ? 'Show All Markers'
            : 'Hide All Markers';
    }, [activeCategoryList.length, allCategories.length]);

    const showResetCollectionButton = useMemo(() => {
        return collectedMarkerIds.size > 0;
    }, [collectedMarkerIds]);

    const resetCollection = useCallback(() => {
        setCollectedMarkerIds(new Set([]));
    }, [setCollectedMarkerIds]);

    return (
        <Menu>
            <div className={styles.header}>
                <Searchbar onSearchAction={setQuery} />
            </div>

            <MarkerCollectionDisplay></MarkerCollectionDisplay>

            <div className={`${styles.buttonGroupHorizontal} ${
                showResetCollectionButton
                    ? styles.gap
                    : styles.noGap
            }`}>
                <button className={styles.button} onClick={toggleAllCategories}>
                    {toggleAllCategoriesText}
                </button>
                <button
                    className={`${styles.button} ${
                        showResetCollectionButton
                            ? styles.visible
                            : styles.hidden
                    }`}
                    onClick={resetCollection}
                >
                    Reset Collection
                </button>
            </div>

            <div className={styles.scrollArea}>
                {!query.trim() &&
                    categoryGroups.map((group) => {
                        const anyActive = group.entries.some(
                            ({ id }) => activeCategories[id]
                        );
                        const allActive = group.entries.every(
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

                        const entries = group.entries.map(({ label, id }) => ({
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

                <div className={styles.results}>
                    <Results results={results} onSelect={flyToMarker} />
                    {query && results.length === 0 && (
                        <div className={styles.noResult}>
                            No matches. (´•︵•`)
                        </div>
                    )}
                </div>
            </div>
        </Menu>
    );
};

export default Filter;
