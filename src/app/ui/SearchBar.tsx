'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SearchBar = ({ defaultValue } : {defaultValue: string}) => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState(defaultValue || '');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Perform search logic here using the searchTerm state
        router.push(`/search?q=${searchTerm}`)
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-row">
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Files that mention..."
                className="border-2 border-gray-300 rounded-md mr-3 w-72 text-black"
            />
            <button type="submit" className="border-2 border-gray-300 rounded-md p-1">Search</button>
        </form>
    );
};

export default SearchBar;
