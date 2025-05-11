
import { GhostProfile, Report } from "../../types";

// Define the filter type
export interface Filter {
  type: string;
  label: string;
  value: any;
}

export interface GhostContextType {
  ghostProfiles: GhostProfile[];
  reports: Report[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addReport: (report: Report) => void;
  filteredGhosts: GhostProfile[];
  getGhostById: (id: string) => GhostProfile | undefined;
  activeFilters: Filter[];
  setActiveFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  isFiltering: boolean;
  isLoading: boolean;
  error: string | null;
  refreshGhosts: () => void; // Make refreshGhosts required, not optional
}
