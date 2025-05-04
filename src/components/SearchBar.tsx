
import React from "react";
import { Input } from "./ui/input";
import { useGhost } from "@/contexts/GhostContext";
import { Search } from "lucide-react";

const SearchBar = () => {
  const { searchTerm, setSearchTerm } = useGhost();

  return (
    <div className="relative max-w-2xl mx-auto w-full mb-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
      <Input
        type="text"
        placeholder="Search for companies or recruiters..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 py-6 text-lg border-gray-300 focus:border-black focus:ring-black"
      />
    </div>
  );
};

export default SearchBar;
