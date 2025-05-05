
import { Report, GhostProfile } from '@/types';
import { mockReports } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';

// Types for Supabase tables
export type ReportRow = {
  id?: string;
  reporter_name: string;
  reporter_email: string;
  ghost_name: string;
  company_name?: string;
  ghost_photo_url: string;
  date_ghosted: string; // Postgres date format
  evidence_url: string;
  venmo_handle?: string;
  location?: string;
  created_at?: string; // Postgres date format
};

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
      console.error('Error fetching reports:', error);
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
      console.error('Error creating report:', error);
      throw error;
    }
    
    return data ? rowToReport(data) : null;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
}

// Function to migrate mock data to Supabase
export async function migrateMockData(): Promise<void> {
  console.log("Starting migration of mock data to Supabase...");
  
  try {
    // Check if data already exists
    const { count, error: countError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking existing data:', countError);
      return;
    }
    
    // Only migrate if no data exists
    if ((count || 0) === 0) {
      console.log("No existing data found, proceeding with migration...");
      
      // Convert mock reports to rows
      const reportRows = mockReports.map(reportToRow);
      
      // Insert mock reports one by one to prevent batch issues
      let successCount = 0;
      for (const row of reportRows) {
        const { error } = await supabase
          .from('reports')
          .insert([row]);
        
        if (!error) {
          successCount++;
        } else {
          console.error("Error migrating report:", error);
        }
      }
      
      console.log(`Migration completed: ${successCount}/${reportRows.length} reports migrated`);
    } else {
      console.log("Data already exists in the database, skipping migration.");
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
}
