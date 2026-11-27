'use client';

import { useState, ChangeEvent } from 'react';
import { XCircleIcon } from '@phosphor-icons/react';

type Props = {
    onSearchAction: (query: string) => void;
    className?: string;
};

export default function Searchbar({ onSearchAction, className }: Props) {
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
        <div
            id="searchBar"
            className={className ? `outline ${className}` : 'outline'}
            style={{ gap: '0.5rem' }}
        >
            <input
                style={{ width: '100%' }}
                placeholder="Search …"
                value={query}
                onChange={handleChange}
            />

            {query && (
                <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                >
                    <XCircleIcon size={20} weight="regular" />
                </button>
            )}
        </div>
    );
}
