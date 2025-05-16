'use client';
import { useState, ChangeEvent } from 'react';
import styles from './searchbar.module.css';

type Props = {
  onSearch: (query: string) => void;
};

export default function Searchbar({ onSearch }: Props) {
  const [query, setQuery] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className={styles.searchBar}>
      <input
        className={styles.input}
        placeholder="Search …"
        value={query}
        onChange={handleChange}
      />
    </div>
  );
}
