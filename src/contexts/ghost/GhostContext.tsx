
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GhostProfile, Report } from "../../types";
import { toast } from "@/components/ui/use-toast";
import { fetchReports, createReport, migrateMockData } from "@/lib/supabase";
import { initializeDatabase } from "@/lib/supabaseSetup";
import { GhostContextType, Filter } from "./types";
import { generateGhostProfiles } from "./ghostUtils";
import { useGhostFilter } from "./useGhostFilter";

const GhostContext = createContext<GhostContextType | undefined>(undefined);

export function GhostProvider({ children }: { children: ReactNode }) {
  const [ghostProfiles, setGhostProfiles] = useState<GhostProfile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Use the custom hook for filtering ghosts
  const { filteredGhosts, isFiltering } = useGhostFilter(ghostProfiles, searchTerm, activeFilters);

  // Function to fetch and initialize data
  const fetchAndInitializeData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Initialize the database to ensure the table exists
      try {
        await initializeDatabase();
        console.log("Database initialized successfully");
      } catch (err) {
        console.warn('Database initialization issues (continuing anyway):', err);
      }
      
      // Force migration of all mock data to Supabase
      try {
        await migrateMockData(true); // Pass true to force migration of all data
        console.log("Mock data migration completed");
      } catch (err) {
        console.warn('Data migration issues (continuing anyway):', err);
        // If migration fails but we have retry attempts left, increment the retry counter
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
          return; // Exit early to trigger a retry
        }
      }
      
      // Then fetch all reports from Supabase
      try {
        const supabaseReports = await fetchReports();
        console.log(`Fetched ${supabaseReports.length} reports from Supabase`);
        
        if (supabaseReports.length === 0 && retryCount < 2) {
          console.warn("No reports found, will retry");
          setRetryCount(prev => prev + 1);
          return; // Exit early to trigger a retry
        } else if (supabaseReports.length === 0) {
          setError("No reports found in the database. Please add a report to get started.");
          setReports([]);
          setGhostProfiles([]);
        } else {
          setReports(supabaseReports);
          // Generate ghost profiles ONLY from Supabase reports
          const profiles = generateGhostProfiles(supabaseReports);
          setGhostProfiles(profiles);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Failed to load reports from the database. Please try again later.");
        setReports([]);
        setGhostProfiles([]);
      }
    } catch (err) {
      console.error("Top level error in initializeApp:", err);
      setError("Failed to initialize application. Please try again later.");
      setReports([]);
      setGhostProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reports from Supabase on mount and migrate data if needed
  useEffect(() => {
    fetchAndInitializeData();
  }, [retryCount]); // Add retryCount as a dependency to trigger re-runs when it changes

  // Function to manually refresh ghost data
  const refreshGhosts = () => {
    console.log("Manually refreshing ghost data");
    fetchAndInitializeData();
  };

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
      setGhostProfiles(prevGhosts => {
        const updatedGhosts = generateGhostProfiles([savedReport, ...reports]);
        return updatedGhosts;
      });

      toast({
        title: "Report submitted",
        description: `You've reported ${report.ghostName} for ghosting. Thank you for your contribution!`
      });
      
      return savedReport;
    } catch (err) {
      console.error("Error adding report:", err);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
      throw err;
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
    error,
    refreshGhosts // Add the refreshGhosts function to the context
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
