'use client';
import type { NextPage } from 'next';
import styles from './filter.module.css';
import Category from './filter/category';
import Searchbar from './filter/searchbar';
import { useState, useMemo } from 'react';
import { useMarkerLayerContext } from '../context/marker-layer';
import { categoryGroups } from './filter/config';
import Results from './filter/results';
import Menu from './menu';

const Filter: NextPage = () => {
  const {
    enabled,
    toggleCategory,
    popups,
    flyToMarker,
    bookmarkIds,
    toggleBookmark,
    toggleBookmarks,
    categoryBookmarkMap,
  } = useMarkerLayerContext();

  const [query, setQuery] = useState('');

  type MarkerSearchResult = {
    markerId: string;
    categoryId: string;
    itemId: string;
    title: string;
    subtitle?: string;
  };

  const results = useMemo((): MarkerSearchResult[] => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const matches: MarkerSearchResult[] = [];

    for (const [markerId, categories] of Object.entries(popups)) {
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
  }, [query, popups]);

  return (
    <Menu>
      <div className={styles.header}>
        <Searchbar onSearch={setQuery} />
      </div>
      <div className={styles.scrollArea}>
        {!query.trim() &&
          categoryGroups.map((group) => {
            const isActive = group.entries.some(({ id }) => enabled[id]);
            const toggleAll = () => {
              const anyActive = group.entries.some(({ id }) => enabled[id]);
              group.entries.forEach(({ id }) => {
                if (enabled[id] === anyActive) {
                  toggleCategory(id);
                }
              });
            };

            const entries = group.entries.map(({ label, id }) => {
              const entryBookmarkIds = categoryBookmarkMap[id] || [];

              let bookmarkState: 'none' | 'partial' | 'full' = 'none';
              if (entryBookmarkIds.length > 0) {
                const count = entryBookmarkIds.filter((bid) =>
                  bookmarkIds.includes(bid)
                ).length;
                if (count === entryBookmarkIds.length) {
                  bookmarkState = 'full';
                } else if (count > 0) {
                  bookmarkState = 'partial';
                }
              }

              return {
                label,
                isActive: enabled[id],
                onToggle: () => toggleCategory(id),
                onToggleBookmark: () => toggleBookmarks(id),
                bookmarkState,
              };
            });

            return (
              <Category
                key={group.title}
                title={group.title}
                isActive={isActive}
                onToggle={toggleAll}
                entries={entries}
              />
            );
          })}

        <div className={styles.results}>
          <Results
            results={results}
            bookmarkIds={bookmarkIds}
            onSelect={flyToMarker}
            toggleBookmark={toggleBookmark}
            toggleBookmarks={(ids) => ids.forEach(toggleBookmark)}
          />
          {query && results.length === 0 && (
            <div className={styles.noResult}>No matches. (´•︵•`)</div>
          )}
        </div>
      </div>
    </Menu>
  );
};

export default Filter;
