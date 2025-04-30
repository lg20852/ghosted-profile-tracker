
import React, { createContext, useContext, useState, ReactNode } from "react";
import { GhostProfile, Report } from "../types";
import { mockGhostProfiles, mockReports } from "../data/mockData";
import { toast } from "@/components/ui/use-toast";

interface GhostContextType {
  ghostProfiles: GhostProfile[];
  reports: Report[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addReport: (report: Report) => void;
  filteredGhosts: GhostProfile[];
  getGhostById: (id: string) => GhostProfile | undefined;
}

const GhostContext = createContext<GhostContextType | undefined>(undefined);

export function GhostProvider({ children }: { children: ReactNode }) {
  const [ghostProfiles, setGhostProfiles] = useState<GhostProfile[]>(mockGhostProfiles);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGhosts = searchTerm
    ? ghostProfiles.filter(ghost => 
        ghost.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : ghostProfiles;

  const addReport = (report: Report) => {
    // Add an ID and timestamp
    const newReport = {
      ...report,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    // Update reports
    setReports(prev => [newReport, ...prev]);

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
        spookCount: ghost.spookCount + 1,
        lastSeen: report.dateGhosted,
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
        photoURL: report.ghostPhotoURL,
        spookCount: 1,
        lastSeen: report.dateGhosted,
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
    getGhostById
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
