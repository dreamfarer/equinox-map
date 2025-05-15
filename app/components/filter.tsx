'use client';
import type { NextPage } from 'next';
import styles from './filter.module.css';
import Category from './filter/category';
import SearchBar from './filter/searchbar';
import { useMarkerLayerContext } from '../context/marker-layer';

const Filter: NextPage = () => {
  const { enabled, toggleCategory } = useMarkerLayerContext();

  return (
    <div className={styles.menu}>
      <SearchBar
        onSearch={() => {
          // console.log('Searching for:', query);
          // TO-DO: Implement proper filtering
        }}
      />
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
    </div>
  );
};

export default Filter;
