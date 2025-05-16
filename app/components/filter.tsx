'use client';
import type { NextPage } from 'next';
import styles from './filter.module.css';
import Category from './filter/category';
import Searchbar from './filter/searchbar';
import Result from './filter/result';
import { useState, useMemo } from 'react';
import { useMarkerLayerContext } from '../context/marker-layer';

const Filter: NextPage = () => {
  const {
    enabled,
    toggleCategory,
    markers,
    flyToMarker,
    bookmarks,
    toggleBookmark,
  } = useMarkerLayerContext();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [] as typeof markers;
    const q = query.toLowerCase();
    return markers.filter((m) =>
      `${m.title} ${m.subtitle}`.toLowerCase().includes(q),
    );
  }, [query, markers]);

  return (
    <div className={styles.menu}>
      <Searchbar onSearch={setQuery} />
      {!query.trim() && (
        <Category
          title="Locations"
          isActive={enabled.characters || enabled.vendors}
          onToggle={() => {
            toggleCategory('characters');
            toggleCategory('vendors');
          }}
          entries={[
            {
              label: 'Characters',
              isActive: enabled.characters,
              onToggle: () => toggleCategory('characters'),
            },
            {
              label: 'Vendors',
              isActive: enabled.vendors,
              onToggle: () => toggleCategory('vendors'),
            },
          ]}
        />
      )}
      <div className={styles.results}>
        {results.map((m) => (
          <Result
            key={m.id}
            marker={m}
            isBookmarked={bookmarks.includes(m.id)}
            onSelect={flyToMarker}
            onToggleBookmark={toggleBookmark}
          />
        ))}
        {query && results.length === 0 && (
          <div className={styles.noResult}>No matches</div>
        )}
      </div>
    </div>
  );
};

export default Filter;
