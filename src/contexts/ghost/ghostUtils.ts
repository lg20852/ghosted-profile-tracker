
import { GhostProfile, Report } from "../../types";

// Generate ghost profiles from reports
export const generateGhostProfiles = (reportList: Report[]): GhostProfile[] => {
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

// Create or update a ghost profile from a new report
export const updateGhostFromReport = (
  ghostProfiles: GhostProfile[], 
  report: Report
): GhostProfile[] => {
  const existingGhostIndex = ghostProfiles.findIndex(
    ghost => ghost.name.toLowerCase() === report.ghostName.toLowerCase()
  );

  // Extract company name from the report
  const companyName = report.companyName || "";

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
    
    return updatedGhosts;
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
    
    return [newGhost, ...ghostProfiles];
  }
};
