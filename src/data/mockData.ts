
import { GhostProfile, Report } from "../types";

export const mockGhostProfiles: GhostProfile[] = [
  {
    id: "1",
    name: "TechGiant Corp",
    photoURL: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    spookCount: 42,
    lastSeen: new Date(2025, 3, 15),
    victimVenmos: ["@john-doe", "@jane-smith", "@alex-jones"]
  },
  {
    id: "2",
    name: "Startup Innovations",
    photoURL: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    spookCount: 27,
    lastSeen: new Date(2025, 3, 20),
    victimVenmos: ["@sam-wilson", "@maria-garcia"]
  },
  {
    id: "3",
    name: "James Johnson (Recruiter)",
    photoURL: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    spookCount: 18,
    lastSeen: new Date(2025, 4, 1),
    victimVenmos: ["@chris-brown", "@taylor-swift", "@ed-sheeran"]
  },
  {
    id: "4",
    name: "Global Recruiters Inc",
    photoURL: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b",
    spookCount: 31,
    lastSeen: new Date(2025, 3, 28),
    victimVenmos: ["@robert-smith", "@susan-miller"]
  },
  {
    id: "5",
    name: "Future Talents Agency",
    photoURL: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    spookCount: 15,
    lastSeen: new Date(2025, 3, 10),
    victimVenmos: ["@mike-jones", "@linda-brown"]
  }
];

export const mockReports: Report[] = [
  {
    id: "1",
    reporterName: "John Doe",
    reporterEmail: "john@example.com",
    ghostName: "TechGiant Corp",
    ghostPhotoURL: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    dateGhosted: new Date(2025, 3, 15),
    evidenceURL: "https://example.com/evidence1",
    venmoHandle: "@john-doe",
    createdAt: new Date(2025, 3, 16)
  },
  {
    id: "2",
    reporterName: "Jane Smith",
    reporterEmail: "jane@example.com",
    ghostName: "Startup Innovations",
    ghostPhotoURL: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    dateGhosted: new Date(2025, 3, 20),
    evidenceURL: "https://example.com/evidence2",
    venmoHandle: "@jane-smith",
    createdAt: new Date(2025, 3, 21)
  }
];
