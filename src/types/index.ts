
// src/types/index.ts
// Adding new fields for company name and location

export interface GhostProfile {
  id: string;
  name: string;
  recruiterName?: string;
  company?: string;
  photoURL: string;
  spookCount: number;
  lastSeen: Date;
  location?: string;
  victimVenmos: string[];
}

export interface Report {
  id?: string;
  reporterName: string;
  reporterEmail: string;
  ghostName: string;
  companyName?: string;
  ghostPhotoURL: string;
  dateGhosted: Date;
  evidenceURL: string;
  venmoHandle?: string;
  location?: string;
  createdAt?: Date;
}
