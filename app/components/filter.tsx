'use client';

import type { NextPage } from 'next';
import { useMemo, useState } from 'react';
import Category from '@/app/components/filter/category';
import Searchbar from '@/app/components/filter/searchbar';
import { useMarkerContext } from '@/app/context/marker-context';
import { categoryGroups } from '@/app/components/filter/config';
import Results from '@/app/components/filter/results';
import Menu from '@/app/components/menu';
import { useFlyToMarker } from '@/app/hooks/use-fly-to-marker';
import { useMapContext } from '@/app/context/map-context';
import { useFilterContext } from '@/app/context/filter-context';
import styles from '@/app/components/filter.module.css';

type MarkerSearchResult = {
    markerId: string;
    categoryId: string;
    itemId: string;
    title: string;
    subtitle?: string;
};

const Filter: NextPage = () => {
    const { mapInstance } = useMapContext();
    const { allMarkers, allPopups } = useMarkerContext();
    const { activeCategories, setActiveCategories, toggleActiveCategory } =
        useFilterContext();
    const flyToMarker = useFlyToMarker(mapInstance, allPopups, allMarkers);
    const [query, setQuery] = useState('');

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

    return (
        <Menu>
            <div className={styles.header}>
                <Searchbar onSearchAction={setQuery} />
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

                                for (const { id } of group.entries) {
                                    next[id] = nextValue;
                                }

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
