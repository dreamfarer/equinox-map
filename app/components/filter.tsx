'use client';
import type { NextPage } from 'next';
import styles from './filter.module.css';
import Category from './filter/category';
import Searchbar from './filter/searchbar';
import Result from './filter/result';
import { useState, useMemo } from 'react';
import { useMarkerLayerContext } from '../context/marker-layer';
import { categoryGroups } from './filter/config';

const Filter: NextPage = () => {
  const {
    enabled,
    toggleCategory,
    popups,
    flyToMarker,
    bookmarkIds,
    toggleBookmark,
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
    <div className={styles.menu}>
      <div className={styles.header}>
        <Searchbar onSearch={setQuery} />
      </div>
      <div className={styles.scrollArea}>
        {!query.trim() &&
          categoryGroups.map((group) => {
            const isActive = group.entries.some(({ id }) => enabled[id]);
            const toggleAll = () =>
              group.entries.forEach(({ id }) => toggleCategory(id));
            const entries = group.entries.map(({ label, id }) => ({
              label,
              isActive: enabled[id],
              onToggle: () => toggleCategory(id),
            }));

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
          {results.map((r) => {
            const bookmarkId = `${r.markerId}::${r.categoryId}::${r.itemId}`;
            const isBookmarked = bookmarkIds.includes(bookmarkId);
            return (
              <Result
                key={bookmarkId}
                title={r.title}
                subtitle={r.subtitle}
                category={r.categoryId}
                isBookmarked={isBookmarked}
                onSelect={() => flyToMarker(r.markerId, r.categoryId)}
                onToggleBookmark={() => toggleBookmark(bookmarkId)}
              />
            );
          })}
          {query && results.length === 0 && (
            <div className={styles.noResult}>No matches. (´•︵•`)</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filter;
