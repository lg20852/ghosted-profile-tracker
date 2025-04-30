
export interface Report {
  id?: string;
  reporterName: string;
  reporterEmail: string;
  ghostName: string;
  ghostPhotoURL: string;
  dateGhosted: Date;
  evidenceURL: string;
  venmoHandle?: string;
  createdAt?: Date;
}

export interface GhostProfile {
  id?: string;
  name: string;
  photoURL: string;
  spookCount: number;
  lastSeen: Date;
  victimVenmos: string[];
}
