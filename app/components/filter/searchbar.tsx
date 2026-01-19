'use client';

import { useState, ChangeEvent } from 'react';
import styles from '@/app/components/filter/searchbar.module.css';

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
