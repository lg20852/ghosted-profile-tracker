import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GhostProfile, Report } from "../types";
import { mockGhostProfiles } from "../data/mockData";
import { toast } from "@/components/ui/use-toast";
import { isAfter, isBefore, subDays } from "date-fns";
import { fetchReports, createReport } from "@/lib/supabase";

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
  isLoading: boolean;
  error: string | null;
}

const GhostContext = createContext<GhostContextType | undefined>(undefined);

export function GhostProvider({ children }: { children: ReactNode }) {
  const [ghostProfiles, setGhostProfiles] = useState<GhostProfile[]>(mockGhostProfiles);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports from Supabase on mount
  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        const supabaseReports = await fetchReports();
        setReports(supabaseReports);
        
        // Generate ghost profiles from reports
        const profiles = generateGhostProfiles(supabaseReports);
        setGhostProfiles(profiles);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Failed to load reports. Please try again later.");
        // Keep the mock data as fallback
      } finally {
        setIsLoading(false);
      }
    }
    
    loadReports();
  }, []);

  // Generate ghost profiles from reports
  const generateGhostProfiles = (reportList: Report[]): GhostProfile[] => {
    const profileMap = new Map<string, GhostProfile>();
    
    // Process each report to create or update ghost profiles
    reportList.forEach(report => {
      const ghostKey = report.ghostName.toLowerCase();
      
      if (profileMap.has(ghostKey)) {
        // Update existing ghost
        const existingGhost = profileMap.get(ghostKey)!;
        
        profileMap.set(ghostKey, {
          ...existingGhost,
          recruiterName: report.ghostName,
          company: report.companyName || existingGhost.company,
          spookCount: existingGhost.spookCount + 1,
          lastSeen: report.dateGhosted > existingGhost.lastSeen ? report.dateGhosted : existingGhost.lastSeen,
          location: report.location || existingGhost.location,
          victimVenmos: report.venmoHandle && !existingGhost.victimVenmos.includes(report.venmoHandle)
            ? [...existingGhost.victimVenmos, report.venmoHandle]
            : existingGhost.victimVenmos
        });
      } else {
        // Create new ghost
        profileMap.set(ghostKey, {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          name: report.ghostName,
          recruiterName: report.ghostName,
          company: report.companyName,
          photoURL: report.ghostPhotoURL,
          spookCount: 1,
          lastSeen: report.dateGhosted,
          location: report.location,
          victimVenmos: report.venmoHandle ? [report.venmoHandle] : []
        });
      }
    });
    
    return Array.from(profileMap.values());
  };

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

  const addReport = async (report: Report) => {
    try {
      // Add an ID and timestamp
      const newReport = {
        ...report,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      
      // Save to Supabase
      const savedReport = await createReport(newReport);
      
      if (!savedReport) {
        throw new Error("Failed to save report");
      }
      
      // Update local state with the saved report
      setReports(prev => [savedReport, ...prev]);

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
    } catch (err) {
      console.error("Error adding report:", err);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    }
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
    isFiltering,
    isLoading,
    error
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
