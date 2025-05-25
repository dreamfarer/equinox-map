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
        {!query.trim() && (
          <>
            <Category
              title="Locations"
              isActive={
                enabled.character ||
                enabled.shop ||
                enabled.race ||
                enabled['fast-travel'] ||
                enabled['scenic-ride'] ||
                enabled.cave
              }
              onToggle={() => {
                toggleCategory('character');
                toggleCategory('shop');
                toggleCategory('race');
                toggleCategory('fast-travel');
                toggleCategory('scenic-ride');
                toggleCategory('cave');
              }}
              entries={[
                {
                  label: 'Characters',
                  isActive: enabled.character,
                  onToggle: () => toggleCategory('character'),
                },
                {
                  label: 'Shops',
                  isActive: enabled.shop,
                  onToggle: () => toggleCategory('shop'),
                },
                {
                  label: 'Races',
                  isActive: enabled.race,
                  onToggle: () => toggleCategory('race'),
                },
                {
                  label: 'Fast Travel Points',
                  isActive: enabled['fast-travel'],
                  onToggle: () => toggleCategory('fast-travel'),
                },
                {
                  label: 'Scenic Rides',
                  isActive: enabled['scenic-ride'],
                  onToggle: () => toggleCategory('scenic-ride'),
                },
                {
                  label: 'Caves',
                  isActive: enabled.cave,
                  onToggle: () => toggleCategory('cave'),
                },
              ]}
            />
            <Category
              title="Quests"
              isActive={
                enabled['weekly-quest'] ||
                enabled['side-quest'] ||
                enabled['main-quest']
              }
              onToggle={() => {
                toggleCategory('weekly-quest');
                toggleCategory('side-quest');
                toggleCategory('main-quest');
              }}
              entries={[
                {
                  label: 'Weekly Quests',
                  isActive: enabled['weekly-quest'],
                  onToggle: () => toggleCategory('weekly-quest'),
                },
                {
                  label: 'Main Quests',
                  isActive: enabled['main-quest'],
                  onToggle: () => toggleCategory('main-quest'),
                },
                {
                  label: 'Side Quests',
                  isActive: enabled['side-quest'],
                  onToggle: () => toggleCategory('side-quest'),
                },
              ]}
            />
            <Category
              title="Resources"
              isActive={
                enabled.antler ||
                enabled.apple ||
                enabled.blackberry ||
                enabled.carrot ||
                enabled.dandelion ||
                enabled.delphinium ||
                enabled['dryad-saddle-mushroom'] ||
                enabled['eagle-feather'] ||
                enabled.fossil ||
                enabled.horseshoe ||
                enabled['king-boletus-mushroom'] ||
                enabled.moss ||
                enabled.poppy ||
                enabled.raspberry ||
                enabled['raven-feather'] ||
                enabled['seagull-feather'] ||
                enabled['sulfur-shelf-mushroom'] ||
                enabled.sunflower ||
                enabled.violet ||
                enabled['water-lily']
              }
              onToggle={() => {
                toggleCategory('antler');
                toggleCategory('apple');
                toggleCategory('blackberry');
                toggleCategory('carrot');
                toggleCategory('dandelion');
                toggleCategory('delphinium');
                toggleCategory('dryad-saddle-mushroom');
                toggleCategory('eagle-feather');
                toggleCategory('fossil');
                toggleCategory('horseshoe');
                toggleCategory('king-boletus-mushroom');
                toggleCategory('moss');
                toggleCategory('poppy');
                toggleCategory('raspberry');
                toggleCategory('raven-feather');
                toggleCategory('seagull-feather');
                toggleCategory('sulfur-shelf-mushroom');
                toggleCategory('sunflower');
                toggleCategory('violet');
                toggleCategory('water-lily');
              }}
              entries={[
                {
                  label: 'Antlers',
                  isActive: enabled.antler,
                  onToggle: () => toggleCategory('antler'),
                },
                {
                  label: 'Apples',
                  isActive: enabled.apple,
                  onToggle: () => toggleCategory('apple'),
                },
                {
                  label: 'Blackberries',
                  isActive: enabled.blackberry,
                  onToggle: () => toggleCategory('blackberry'),
                },
                {
                  label: 'Carrots',
                  isActive: enabled.carrot,
                  onToggle: () => toggleCategory('carrot'),
                },
                {
                  label: 'Dandelions',
                  isActive: enabled.dandelion,
                  onToggle: () => toggleCategory('dandelion'),
                },
                {
                  label: 'Delphiniums',
                  isActive: enabled.delphinium,
                  onToggle: () => toggleCategory('delphinium'),
                },
                {
                  label: 'Dryad Saddle Mushrooms',
                  isActive: enabled['dryad-saddle-mushroom'],
                  onToggle: () => toggleCategory('dryad-saddle-mushroom'),
                },
                {
                  label: 'Eagle Feathers',
                  isActive: enabled['eagle-feather'],
                  onToggle: () => toggleCategory('eagle-feather'),
                },
                {
                  label: 'Fossils',
                  isActive: enabled.fossil,
                  onToggle: () => toggleCategory('fossil'),
                },
                {
                  label: 'Horseshoes',
                  isActive: enabled.horseshoe,
                  onToggle: () => toggleCategory('horseshoe'),
                },
                {
                  label: 'King Boletus Mushrooms',
                  isActive: enabled['king-boletus-mushroom'],
                  onToggle: () => toggleCategory('king-boletus-mushroom'),
                },
                {
                  label: 'Moss',
                  isActive: enabled.moss,
                  onToggle: () => toggleCategory('moss'),
                },
                {
                  label: 'Poppies',
                  isActive: enabled.poppy,
                  onToggle: () => toggleCategory('poppy'),
                },
                {
                  label: 'Raspberries',
                  isActive: enabled.raspberry,
                  onToggle: () => toggleCategory('raspberry'),
                },
                {
                  label: 'Raven Feathers',
                  isActive: enabled['raven-feather'],
                  onToggle: () => toggleCategory('raven-feather'),
                },
                {
                  label: 'Seagull Feathers',
                  isActive: enabled['seagull-feather'],
                  onToggle: () => toggleCategory('seagull-feather'),
                },
                {
                  label: 'Sulfur Shelf Mushrooms',
                  isActive: enabled['sulfur-shelf-mushroom'],
                  onToggle: () => toggleCategory('sulfur-shelf-mushroom'),
                },
                {
                  label: 'Sunflowers',
                  isActive: enabled.sunflower,
                  onToggle: () => toggleCategory('sunflower'),
                },
                {
                  label: 'Violets',
                  isActive: enabled.violet,
                  onToggle: () => toggleCategory('violet'),
                },
                {
                  label: 'Water Lilies',
                  isActive: enabled['water-lily'],
                  onToggle: () => toggleCategory('water-lily'),
                },
              ]}
            />
          </>
        )}
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
