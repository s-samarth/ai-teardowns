'use client';

import { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 mb-12">
            <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xl">
                    search
                </span>
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder="Search teardowns, architectures, or startups..."
                    className="w-full bg-neutral-dark border border-border-dark rounded-lg py-3.5 pl-12 pr-4 text-white placeholder:text-text-secondary text-sm focus:border-primary transition-colors"
                />
            </div>
        </div>
    );
}
