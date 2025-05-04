
import React, { useState } from "react";
import { Input } from "./ui/input";
import { useGhost } from "@/contexts/GhostContext";
import { Search } from "lucide-react";

const SearchBar = () => {
  const { searchTerm, setSearchTerm } = useGhost();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(item => item !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const isFilterActive = (filter: string) => activeFilters.includes(filter);

  return (
    <div className="max-w-full mx-auto w-full">
      <label htmlFor="search" className="text-lg font-medium block mb-3">Search by recruiter or company</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
        <Input
          id="search"
          type="text"
          placeholder="Search for companies or recruiters who ghosted candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-6 text-lg border-gray-300 focus:border-black focus:ring-black"
          autoComplete="off"
        />
      </div>
      <div className="flex overflow-x-auto pb-2 mt-4 hide-scrollbar">
        <div className="flex flex-nowrap gap-2">
          <span 
            className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors ${
              isFilterActive('Recruiter') ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => toggleFilter('Recruiter')}
          >
            Recruiter
          </span>
          <span 
            className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors ${
              isFilterActive('Company') ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => toggleFilter('Company')}
          >
            Company
          </span>
          <span 
            className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors ${
              isFilterActive('Date') ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => toggleFilter('Date')}
          >
            Date
          </span>
          <span 
            className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors ${
              isFilterActive('Location') ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => toggleFilter('Location')}
          >
            Location
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
