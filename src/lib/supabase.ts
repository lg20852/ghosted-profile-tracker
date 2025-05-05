
import { createClient } from '@supabase/supabase-js';
import { Report, GhostProfile } from '@/types';

// Types for Supabase tables
export type ReportRow = Omit<Report, 'id' | 'dateGhosted' | 'createdAt'> & {
  id?: string;
  date_ghosted: string; // Postgres date format
  created_at?: string; // Postgres date format
};

// Create a Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions to convert between Report interface and ReportRow (database format)
export function reportToRow(report: Report): ReportRow {
  return {
    reporter_name: report.reporterName,
    reporter_email: report.reporterEmail,
    ghost_name: report.ghostName,
    company_name: report.companyName,
    ghost_photo_url: report.ghostPhotoURL,
    date_ghosted: report.dateGhosted.toISOString(),
    evidence_url: report.evidenceURL,
    venmo_handle: report.venmoHandle,
    location: report.location
  };
}

export function rowToReport(row: any): Report {
  return {
    id: row.id,
    reporterName: row.reporter_name,
    reporterEmail: row.reporter_email,
    ghostName: row.ghost_name,
    companyName: row.company_name,
    ghostPhotoURL: row.ghost_photo_url,
    dateGhosted: new Date(row.date_ghosted),
    evidenceURL: row.evidence_url,
    venmoHandle: row.venmo_handle,
    location: row.location,
    createdAt: row.created_at ? new Date(row.created_at) : undefined
  };
}

// CRUD operations for reports
export async function fetchReports(): Promise<Report[]> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return (data || []).map(rowToReport);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

export async function createReport(report: Report): Promise<Report | null> {
  try {
    const reportRow = reportToRow(report);
    
    const { data, error } = await supabase
      .from('reports')
      .insert([reportRow])
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return rowToReport(data);
  } catch (error) {
    console.error('Error creating report:', error);
    return null;
  }
}
