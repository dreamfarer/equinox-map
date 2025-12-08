'use client';
import type { NextPage } from 'next';
import styles from './filter.module.css';
import Category from './filter/category';
import Searchbar from './filter/searchbar';
import { useState, useMemo } from 'react';
import { useMarkerContext } from '../context/marker-context';
import { categoryGroups } from './filter/config';
import Menu from './menu';
import { usePopupContext } from '../context/popup-context';

type MarkerSearchResult = {
  markerId: string;
  categoryId: string;
  itemId: string;
  title: string;
  subtitle?: string;
};

const Filter: NextPage = () => {
  const { activeCategories, toggleCategory } = useMarkerContext();
  const { popups } = usePopupContext();
  // const flyToMarker = useFlyToMarker(mapInstance, popups, markers);
  const [query, setQuery] = useState('');

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
            const isActive = group.entries.some(
              ({ id }) => activeCategories[id]
            );
            const toggleAll = () => {
              const anyActive = group.entries.some(
                ({ id }) => activeCategories[id]
              );
              group.entries.forEach(({ id }) => {
                if (activeCategories[id] === anyActive) {
                  toggleCategory(id);
                }
              });
            };

            const entries = group.entries.map(({ label, id }) => {
              return {
                label,
                isActive: activeCategories[id],
                onToggle: () => toggleCategory(id),
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

        {/* comment <div className={styles.results}>
          <Results results={results} onSelect={flyToMarker} />
          {query && results.length === 0 && (
            <div className={styles.noResult}>No matches. (´•︵•`)</div>
          )}
        </div>
        */}
      </div>
    </Menu>
  );
};

export default Filter;
