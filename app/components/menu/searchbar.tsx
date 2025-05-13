'use client';

import { useState } from 'react';
import styles from './searchbar.module.css';

type Props = {
  placeholder?: string;
  onSearch: (query: string) => void;
};

export default function SearchBar({
  placeholder = 'Filter ...',
  onSearch,
}: Props) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        className={styles.input}
        placeholder={placeholder}
      />
    </div>
  );
}
