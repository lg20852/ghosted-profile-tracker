import React, { useState } from "react";
import { Input } from "./ui/input";
import { useGhost } from "@/contexts/ghost";
import { Search, Calendar, Building, Map as MapIcon } from "lucide-react";
import { Button } from "./ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "./ui/popover";
import { format, subDays, isBefore, isAfter } from "date-fns";

// Define interfaces for better type safety
interface CompanyData {
  name: string;
  count: number;
}

const timeFrames = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 60 days", days: 60 },
  { label: "Last 90 days", days: 90 },
  { label: "All time", days: 0 }
];

const locations = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", 
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin", "Remote"
];

const SearchBar = () => {
  const { searchTerm, setSearchTerm, ghostProfiles, setActiveFilters, activeFilters, isFiltering } = useGhost();
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  // Get unique company names and sort by report count
  const companies = React.useMemo(() => {
    const companyMap = new Map<string, CompanyData>();
    
    // Group by company name and count occurrences
    ghostProfiles.forEach(ghost => {
      if (!ghost.company) return;
      
      const company = ghost.company.toLowerCase();
      if (!companyMap.has(company)) {
        companyMap.set(company, { name: ghost.company, count: 1 });
      } else {
        const current = companyMap.get(company);
        if (current) {
          companyMap.set(company, { ...current, count: current.count + 1 });
        }
      }
    });
    
    // Convert to array and sort by count (descending)
    return Array.from(companyMap.values())
      .sort((a, b) => b.count - a.count);
  }, [ghostProfiles]);

  const toggleDateFilter = (days: number) => {
    // Remove any existing date filters
    const newFilters = activeFilters.filter(f => !f.type.includes('date'));
    
    if (days > 0) {
      const cutoffDate = subDays(new Date(), days);
      newFilters.push({
        type: `date-${days}`,
        label: `Last ${days} days`,
        value: cutoffDate
      });
    }
    
    setActiveFilters(newFilters);
    setOpenPopover(null); // Close popover after selection
  };

  const toggleCompanyFilter = (company: string) => {
    const existingFilter = activeFilters.find(f => f.type === 'company' && f.value === company);
    
    if (existingFilter) {
      setActiveFilters(activeFilters.filter(f => f !== existingFilter));
    } else {
      setActiveFilters([
        ...activeFilters.filter(f => f.type !== 'company'),
        { type: 'company', label: `Company: ${company}`, value: company }
      ]);
    }
    setOpenPopover(null); // Close popover after selection
  };

  const toggleLocationFilter = (location: string) => {
    const existingFilter = activeFilters.find(f => f.type === 'location' && f.value === location);
    
    if (existingFilter) {
      setActiveFilters(activeFilters.filter(f => f !== existingFilter));
    } else {
      setActiveFilters([
        ...activeFilters.filter(f => f.type !== 'location'),
        { type: 'location', label: `Location: ${location}`, value: location }
      ]);
    }
    setOpenPopover(null); // Close popover after selection
  };

  const isFilterActive = (type: string, value?: any) => {
    if (value) {
      return activeFilters.some(f => f.type === type && f.value === value);
    }
    return activeFilters.some(f => f.type.includes(type));
  };

  return (
    <div className="max-w-full mx-auto w-full">
      <label htmlFor="search" className="text-lg font-medium block mb-3">Search by company</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
        <Input
          id="search"
          type="text"
          placeholder="Search for companies that ghosted candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-6 text-lg border-gray-300 focus:border-black focus:ring-black"
          autoComplete="off"
        />
      </div>
      
      {/* Active filter tags */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {activeFilters.map((filter, index) => (
            <span 
              key={index}
              className="px-3 py-1 rounded-full text-sm cursor-pointer bg-black text-white flex items-center gap-1"
              onClick={() => setActiveFilters(activeFilters.filter(f => f !== filter))}
            >
              {filter.label}
              <span className="ml-1">×</span>
            </span>
          ))}
          {activeFilters.length > 0 && (
            <span 
              className="px-3 py-1 rounded-full text-sm cursor-pointer bg-gray-100 hover:bg-gray-200"
              onClick={() => setActiveFilters([])}
            >
              Clear all
            </span>
          )}
        </div>
      )}
      
      <div className="flex overflow-x-auto pb-2 mt-4 hide-scrollbar">
        <div className="flex flex-nowrap gap-2">
          <Popover open={openPopover === 'date'} onOpenChange={(open) => setOpenPopover(open ? 'date' : null)}>
            <PopoverTrigger asChild>
              <span 
                className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1 ${
                  isFilterActive('date') ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" /> Date
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="flex flex-col space-y-1">
                {timeFrames.map(timeFrame => (
                  <Button
                    key={timeFrame.days}
                    variant="ghost"
                    size="sm"
                    className={`justify-start ${isFilterActive(`date-${timeFrame.days}`) ? 'bg-black text-white hover:bg-black hover:text-white' : ''}`}
                    onClick={() => toggleDateFilter(timeFrame.days)}
                  >
                    {timeFrame.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={openPopover === 'company'} onOpenChange={(open) => setOpenPopover(open ? 'company' : null)}>
            <PopoverTrigger asChild>
              <span 
                className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1 ${
                  isFilterActive('company') ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Building className="h-3.5 w-3.5" /> Company
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 max-h-64 overflow-y-auto">
              {isLoadingCompanies ? (
                <div className="flex justify-center p-4">
                  <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                </div>
              ) : companies.length > 0 ? (
                <div className="flex flex-col space-y-1">
                  {companies.map((company) => (
                    <Button
                      key={company.name}
                      variant="ghost"
                      size="sm"
                      className={`justify-start ${isFilterActive('company', company.name) ? 'bg-black text-white hover:bg-black hover:text-white' : ''}`}
                      onClick={() => toggleCompanyFilter(company.name)}
                    >
                      {company.name} ({company.count})
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 p-2">No companies found</p>
              )}
            </PopoverContent>
          </Popover>

          <Popover open={openPopover === 'location'} onOpenChange={(open) => setOpenPopover(open ? 'location' : null)}>
            <PopoverTrigger asChild>
              <span 
                className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1 ${
                  isFilterActive('location') ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" /> Location
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 max-h-64 overflow-y-auto">
              <div className="flex flex-col space-y-1">
                {locations.map(location => (
                  <Button
                    key={location}
                    variant="ghost"
                    size="sm"
                    className={`justify-start ${isFilterActive('location', location) ? 'bg-black text-white hover:bg-black hover:text-white' : ''}`}
                    onClick={() => toggleLocationFilter(location)}
                  >
                    {location}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
