'use client'

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import BackButton from "../ui/BackButton";
import SearchBar from "../ui/SearchBar";
import INodeList from "../ui/INodeList";

const SearchPage = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [children, setChildren] = useState([])

    useEffect(() => {
        const fetchData  = async () => {
            const data = await fetch(`http://localhost:8000/api/search/${query}`, {
                cache: 'no-store', 
            })
            const search_results = await data.json()
            setChildren(search_results)
        }

        fetchData()
    }, [query])

    return (
        <div>
            <BackButton parent_inode_id="0" />
            <SearchBar defaultValue={query}/>
            <INodeList curr_id="0" directory_children={[]} file_children={children} />
        </div>
    );
};

export default SearchPage;