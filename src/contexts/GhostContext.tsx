
import React, { createContext, useContext, useState, ReactNode } from "react";
import { GhostProfile, Report } from "../types";
import { mockGhostProfiles, mockReports } from "../data/mockData";
import { toast } from "@/components/ui/use-toast";

// Define the filter type
export interface Filter {
  type: string;
  label: string;
  value: any;
}

interface GhostContextType {
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
}

const GhostContext = createContext<GhostContextType | undefined>(undefined);

export function GhostProvider({ children }: { children: ReactNode }) {
  const [ghostProfiles, setGhostProfiles] = useState<GhostProfile[]>(mockGhostProfiles);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // Filter ghosts based on search term and active filters
  const filteredGhosts = React.useMemo(() => {
    setIsFiltering(true);
    let result = ghostProfiles;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(ghost => {
        const nameMatch = ghost.name.toLowerCase().includes(searchTerm.toLowerCase());
        const recruiterMatch = ghost.recruiterName?.toLowerCase().includes(searchTerm.toLowerCase());
        const companyMatch = ghost.company?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return nameMatch || recruiterMatch || companyMatch;
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
              // Handle date filters by checking if the ghost's lastSeen date is after the cutoff date
              if (filter.type.startsWith('date-')) {
                const cutoffDate = filter.value;
                const lastSeenDate = new Date(ghost.lastSeen);
                return lastSeenDate >= cutoffDate;
              }
              return true;
          }
        });
      });
    }
    
    setTimeout(() => setIsFiltering(false), 300); // Short delay to simulate loading
    return result;
  }, [ghostProfiles, searchTerm, activeFilters]);

  const addReport = (report: Report) => {
    // Add an ID and timestamp
    const newReport = {
      ...report,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    // Update reports
    setReports(prev => [newReport, ...prev]);

    // Extract company name from the report
    const companyName = report.companyName || "";

    // Check if ghost already exists
    const existingGhostIndex = ghostProfiles.findIndex(
      ghost => ghost.name.toLowerCase() === report.ghostName.toLowerCase()
    );

    if (existingGhostIndex >= 0) {
      // Update existing ghost
      const updatedGhosts = [...ghostProfiles];
      const ghost = updatedGhosts[existingGhostIndex];
      
      updatedGhosts[existingGhostIndex] = {
        ...ghost,
        recruiterName: report.ghostName,
        company: companyName,
        spookCount: ghost.spookCount + 1,
        lastSeen: report.dateGhosted,
        location: report.location || ghost.location,
        victimVenmos: report.venmoHandle && !ghost.victimVenmos.includes(report.venmoHandle)
          ? [...ghost.victimVenmos, report.venmoHandle]
          : ghost.victimVenmos
      };
      
      setGhostProfiles(updatedGhosts);
    } else {
      // Create new ghost
      const newGhost: GhostProfile = {
        id: Date.now().toString(),
        name: report.ghostName,
        recruiterName: report.ghostName,
        company: companyName,
        photoURL: report.ghostPhotoURL,
        spookCount: 1,
        lastSeen: report.dateGhosted,
        location: report.location,
        victimVenmos: report.venmoHandle ? [report.venmoHandle] : []
      };
      
      setGhostProfiles(prev => [newGhost, ...prev]);
    }

    toast({
      title: "Report submitted",
      description: `You've reported ${report.ghostName} for ghosting. Thank you for your contribution!`
    });
  };

  const getGhostById = (id: string) => {
    return ghostProfiles.find(ghost => ghost.id === id);
  };

  const value = {
    ghostProfiles,
    reports,
    searchTerm,
    setSearchTerm,
    addReport,
    filteredGhosts,
    getGhostById,
    activeFilters,
    setActiveFilters,
    isFiltering
  };

  return <GhostContext.Provider value={value}>{children}</GhostContext.Provider>;
}

export const useGhost = () => {
  const context = useContext(GhostContext);
  if (context === undefined) {
    throw new Error("useGhost must be used within a GhostProvider");
  }
  return context;
};
