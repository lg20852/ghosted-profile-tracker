
import { GhostProfile, Report } from "../../types";

// Generate ghost profiles from reports
export const generateGhostProfiles = (reportList: Report[]): GhostProfile[] => {
  const profileMap = new Map<string, GhostProfile>();
  
  // Process each report to create or update ghost profiles
  reportList.forEach(report => {
    // Use company name as the key if available, otherwise use ghost name
    // This ensures all reports from the same company are grouped together
    const companyName = report.companyName || report.ghostName;
    const profileKey = companyName.toLowerCase();
    
    if (profileMap.has(profileKey)) {
      // Update existing company profile
      const existingProfile = profileMap.get(profileKey)!;
      
      profileMap.set(profileKey, {
        ...existingProfile,
        name: companyName, // Ensure the display name is the company name
        recruiterName: report.ghostName !== existingProfile.recruiterName ? 
          `${existingProfile.recruiterName}, ${report.ghostName}` : 
          existingProfile.recruiterName,
        company: companyName,
        spookCount: existingProfile.spookCount + 1,
        lastSeen: report.dateGhosted > existingProfile.lastSeen ? report.dateGhosted : existingProfile.lastSeen,
        location: report.location || existingProfile.location,
        victimVenmos: report.venmoHandle && !existingProfile.victimVenmos.includes(report.venmoHandle)
          ? [...existingProfile.victimVenmos, report.venmoHandle]
          : existingProfile.victimVenmos
      });
    } else {
      // Create new company profile
      profileMap.set(profileKey, {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        name: companyName, // Use company name as the primary name
        recruiterName: report.ghostName,
        company: companyName,
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
  // Use company name as the key if available, otherwise use ghost name
  const companyName = report.companyName || report.ghostName;
  
  const existingProfileIndex = ghostProfiles.findIndex(
    profile => (profile.company || '').toLowerCase() === companyName.toLowerCase()
  );

  if (existingProfileIndex >= 0) {
    // Update existing company profile
    const updatedProfiles = [...ghostProfiles];
    const profile = updatedProfiles[existingProfileIndex];
    
    updatedProfiles[existingProfileIndex] = {
      ...profile,
      name: companyName, // Ensure the display name is the company name
      recruiterName: report.ghostName !== profile.recruiterName ? 
        `${profile.recruiterName}, ${report.ghostName}` : 
        profile.recruiterName,
      company: companyName,
      spookCount: profile.spookCount + 1,
      lastSeen: report.dateGhosted > profile.lastSeen ? report.dateGhosted : profile.lastSeen,
      location: report.location || profile.location,
      victimVenmos: report.venmoHandle && !profile.victimVenmos.includes(report.venmoHandle)
        ? [...profile.victimVenmos, report.venmoHandle]
        : profile.victimVenmos
    };
    
    return updatedProfiles;
  } else {
    // Create new company profile
    const newProfile: GhostProfile = {
      id: Date.now().toString(),
      name: companyName, // Use company name as the primary name
      recruiterName: report.ghostName,
      company: companyName,
      photoURL: report.ghostPhotoURL,
      spookCount: 1,
      lastSeen: report.dateGhosted,
      location: report.location,
      victimVenmos: report.venmoHandle ? [report.venmoHandle] : []
    };
    
    return [newProfile, ...ghostProfiles];
  }
};
