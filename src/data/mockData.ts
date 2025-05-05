
import { GhostProfile, Report } from "../types";

// Mock ghost profiles with company names and locations
export const mockGhostProfiles: GhostProfile[] = [
  {
    id: "1",
    name: "John Smith",
    recruiterName: "John Smith",
    company: "TechGiant Corp",
    photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
    spookCount: 42,
    lastSeen: new Date("2024-04-15"),
    location: "San Francisco",
    victimVenmos: ["@victim1", "@victim2"]
  },
  {
    id: "2",
    name: "Sarah Johnson",
    recruiterName: "Sarah Johnson",
    company: "InnovateTech",
    photoURL: "https://randomuser.me/api/portraits/women/2.jpg",
    spookCount: 28,
    lastSeen: new Date("2024-04-10"),
    location: "New York",
    victimVenmos: ["@victim3"]
  },
  {
    id: "3",
    name: "Robert Williams",
    recruiterName: "Robert Williams",
    company: "Digital Solutions Inc",
    photoURL: "https://randomuser.me/api/portraits/men/3.jpg",
    spookCount: 19,
    lastSeen: new Date("2024-04-05"),
    location: "Austin",
    victimVenmos: []
  },
  {
    id: "4",
    name: "Emily Davis",
    recruiterName: "Emily Davis",
    company: "Future Works LLC",
    photoURL: "https://randomuser.me/api/portraits/women/4.jpg",
    spookCount: 15,
    lastSeen: new Date("2024-03-28"),
    location: "Chicago",
    victimVenmos: ["@victim4"]
  },
  {
    id: "5",
    name: "Michael Brown",
    recruiterName: "Michael Brown",
    company: "Catalyst Recruiting",
    photoURL: "https://randomuser.me/api/portraits/men/5.jpg",
    spookCount: 12,
    lastSeen: new Date("2024-03-22"),
    location: "Los Angeles",
    victimVenmos: []
  },
  {
    id: "6",
    name: "Jennifer Wilson",
    recruiterName: "Jennifer Wilson",
    company: "TechGiant Corp",
    photoURL: "https://randomuser.me/api/portraits/women/6.jpg",
    spookCount: 9,
    lastSeen: new Date("2024-03-15"),
    location: "Seattle",
    victimVenmos: ["@victim5"]
  },
  {
    id: "7",
    name: "David Chen",
    recruiterName: "David Chen",
    company: "Swift Recruiters",
    photoURL: "https://randomuser.me/api/portraits/men/8.jpg",
    spookCount: 4,
    lastSeen: new Date("2025-05-01"), // Very recent report - within the last 7 days
    location: "Boston",
    victimVenmos: ["@victim6"]
  }
];

// Mock reports
export const mockReports: Report[] = [
  {
    id: "1",
    reporterName: "Alex Thompson",
    reporterEmail: "alex@example.com",
    ghostName: "John Smith",
    companyName: "TechGiant Corp",
    ghostPhotoURL: "https://randomuser.me/api/portraits/men/1.jpg",
    dateGhosted: new Date("2024-04-15"),
    evidenceURL: "https://example.com/evidence1",
    venmoHandle: "@alex_t",
    location: "San Francisco",
    createdAt: new Date("2024-04-16")
  },
  {
    id: "2",
    reporterName: "Jamie Roberts",
    reporterEmail: "jamie@example.com",
    ghostName: "Sarah Johnson",
    companyName: "InnovateTech",
    ghostPhotoURL: "https://randomuser.me/api/portraits/women/2.jpg",
    dateGhosted: new Date("2024-04-10"),
    evidenceURL: "https://example.com/evidence2",
    venmoHandle: "@jamie_r",
    location: "New York",
    createdAt: new Date("2024-04-12")
  },
  {
    id: "3",
    reporterName: "Casey Morgan",
    reporterEmail: "casey@example.com",
    ghostName: "Robert Williams",
    companyName: "Digital Solutions Inc",
    ghostPhotoURL: "https://randomuser.me/api/portraits/men/3.jpg",
    dateGhosted: new Date("2024-04-05"),
    evidenceURL: "https://example.com/evidence3",
    location: "Austin",
    createdAt: new Date("2024-04-07")
  },
  {
    id: "4",
    reporterName: "Taylor Reed",
    reporterEmail: "taylor@example.com",
    ghostName: "David Chen",
    companyName: "Swift Recruiters",
    ghostPhotoURL: "https://randomuser.me/api/portraits/men/8.jpg",
    dateGhosted: new Date("2025-05-01"),
    evidenceURL: "https://example.com/evidence4",
    venmoHandle: "@taylor_r",
    location: "Boston",
    createdAt: new Date("2025-05-03") // Created two days after being ghosted
  },
  // Add the missing reports for Emily Davis, Michael Brown, and Jennifer Wilson
  {
    id: "5",
    reporterName: "Jordan Lee",
    reporterEmail: "jordan@example.com",
    ghostName: "Emily Davis",
    companyName: "Future Works LLC",
    ghostPhotoURL: "https://randomuser.me/api/portraits/women/4.jpg",
    dateGhosted: new Date("2024-03-28"),
    evidenceURL: "https://example.com/evidence5",
    venmoHandle: "@jordan_l",
    location: "Chicago",
    createdAt: new Date("2024-03-30")
  },
  {
    id: "6",
    reporterName: "Riley Parker",
    reporterEmail: "riley@example.com",
    ghostName: "Michael Brown",
    companyName: "Catalyst Recruiting",
    ghostPhotoURL: "https://randomuser.me/api/portraits/men/5.jpg",
    dateGhosted: new Date("2024-03-22"),
    evidenceURL: "https://example.com/evidence6",
    location: "Los Angeles",
    createdAt: new Date("2024-03-24")
  },
  {
    id: "7",
    reporterName: "Quinn Adams",
    reporterEmail: "quinn@example.com",
    ghostName: "Jennifer Wilson",
    companyName: "TechGiant Corp",
    ghostPhotoURL: "https://randomuser.me/api/portraits/women/6.jpg",
    dateGhosted: new Date("2024-03-15"),
    evidenceURL: "https://example.com/evidence7",
    venmoHandle: "@quinn_a",
    location: "Seattle",
    createdAt: new Date("2024-03-16")
  }
];
