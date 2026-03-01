'use client';

import { useState, ChangeEvent } from 'react';
import styles from '@/app/components/filter/searchbar.module.css';
import { XCircleIcon } from '@phosphor-icons/react';

type Props = {
    onSearchAction: (query: string) => void;
};

export default function Searchbar({ onSearchAction }: Props) {
    const [query, setQuery] = useState('');

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setQuery(value);
        onSearchAction(value);
    };

    const clearSearch = () => {
        setQuery('');
        onSearchAction('');
    };

    return (
        <div className={styles.searchBar} id="searchBar">
            <input
                className={styles.input}
                placeholder="Search …"
                value={query}
                onChange={handleChange}
            />

            {query && (
                <button
                    type="button"
                    onClick={clearSearch}
                    className={styles.clearButton}
                    aria-label="Clear search"
                >
                    <XCircleIcon size={20} weight="regular" />
                </button>
            )}
        </div>
    );
}
