
import React from "react";
import { Input } from "./ui/input";
import { useGhost } from "@/contexts/GhostContext";
import { Search } from "lucide-react";

const SearchBar = () => {
  const { searchTerm, setSearchTerm } = useGhost();

  return (
    <div className="max-w-full mx-auto w-full mb-8">
      <label htmlFor="search" className="text-lg font-medium block mb-2">Search by recruiter or company</label>
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
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm cursor-pointer hover:bg-gray-200">Recruiter</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm cursor-pointer hover:bg-gray-200">Company</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm cursor-pointer hover:bg-gray-200">Date</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm cursor-pointer hover:bg-gray-200">Location</span>
      </div>
    </div>
  );
};

export default SearchBar;
