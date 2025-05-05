import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GhostProfile, Report } from "../../types";
import { mockGhostProfiles } from "../../data/mockData";
import { toast } from "@/components/ui/use-toast";
import { fetchReports, createReport, migrateMockData } from "@/lib/supabase";
import { initializeDatabase } from "@/lib/supabaseSetup";
import { GhostContextType, Filter } from "./types";
import { generateGhostProfiles, updateGhostFromReport } from "./ghostUtils";
import { useGhostFilter } from "./useGhostFilter";

const GhostContext = createContext<GhostContextType | undefined>(undefined);

export function GhostProvider({ children }: { children: ReactNode }) {
  const [ghostProfiles, setGhostProfiles] = useState<GhostProfile[]>(mockGhostProfiles);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the custom hook for filtering ghosts
  const { filteredGhosts, isFiltering } = useGhostFilter(ghostProfiles, searchTerm, activeFilters);

  // Fetch reports from Supabase on mount and migrate data if needed
  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        // Initialize the database first to ensure the table exists
        await initializeDatabase()
          .catch(err => {
            console.warn('Database initialization issues (continuing anyway):', err);
          });
        
        // Then attempt to migrate mock data
        await migrateMockData();
        
        // Then fetch all reports
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

      // Update ghost profiles based on the new report
      setGhostProfiles(prevGhosts => updateGhostFromReport(prevGhosts, savedReport));

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
