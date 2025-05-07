
import React from 'react';
import { GhostProfile } from '../../types';
import { Filter } from './types';
import { isAfter, subDays } from 'date-fns';

export const useGhostFilter = (
  ghostProfiles: GhostProfile[],
  searchTerm: string,
  activeFilters: Filter[]
) => {
  const [isFiltering, setIsFiltering] = React.useState(false);

  // Filter ghosts based on search term and active filters
  const filteredGhosts = React.useMemo(() => {
    setIsFiltering(true);
    let result = ghostProfiles;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(ghost => {
        const nameMatch = ghost.name.toLowerCase().includes(searchTerm.toLowerCase());
        const companyMatch = ghost.company?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Prioritize company matches over recruiter name matches
        return companyMatch || nameMatch;
      });
    }
    
    // Apply active filters
    if (activeFilters.length > 0) {
      result = result.filter(ghost => {
        return activeFilters.every(filter => {
          switch(filter.type) {
            case 'company':
              return ghost.company?.toLowerCase() === filter.value.toLowerCase();
            
            case 'location':
              return ghost.location?.toLowerCase() === filter.value.toLowerCase();
            
            default:
              // Handle date filters - check if ghost's lastSeen date is within the specified timeframe
              if (filter.type.startsWith('date-')) {
                const currentDate = new Date();
                const days = parseInt(filter.type.split('-')[1]);
                const cutoffDate = subDays(currentDate, days);
                
                // Check if ghost's lastSeen date is after the cutoff date (within the specified days)
                // This means the ghost was reported within the last X days
                return isAfter(ghost.lastSeen, cutoffDate) || 
                       ghost.lastSeen.getTime() === cutoffDate.getTime();
              }
              return true;
          }
        });
      });
    }
    
    setTimeout(() => setIsFiltering(false), 300); // Short delay to simulate loading
    return result;
  }, [ghostProfiles, searchTerm, activeFilters]);

  return {
    filteredGhosts, 
    isFiltering
  };
};
