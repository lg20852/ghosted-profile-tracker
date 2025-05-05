
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
    // Return an empty array instead of mock data when there's an error
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

// Function to migrate mock data to Supabase - UPDATED to force migration of all mock data
export async function migrateMockData(forceUpdate = true): Promise<void> {
  console.log("Starting migration of mock data to Supabase...");
  
  try {
    console.log("Proceeding with migration of all mock data...");
    
    // Convert mock reports to rows
    const reportRows = mockReports.map(reportToRow);
    
    // Process each mock report
    let successCount = 0;
    for (const row of reportRows) {
      // Check if this report (by ghostName and dateGhosted) already exists
      const { data: existingData, error: existingError } = await supabase
        .from('reports')
        .select('id')
        .eq('ghost_name', row.ghost_name)
        .eq('date_ghosted', row.date_ghosted);
        
      if (existingError) {
        console.error('Error checking for existing report:', existingError);
        continue;
      }
      
      // If it exists and we're forcing an update, update it; otherwise insert it
      if (existingData && existingData.length > 0 && forceUpdate) {
        const { error: updateError } = await supabase
          .from('reports')
          .update(row)
          .eq('id', existingData[0].id);
          
        if (updateError) {
          console.error('Error updating existing report:', updateError);
        } else {
          successCount++;
          console.log(`Updated existing report for: ${row.ghost_name}`);
        }
      } else if (!existingData || existingData.length === 0) {
        // Insert if it doesn't exist
        const { error: insertError } = await supabase
          .from('reports')
          .insert([row]);
          
        if (insertError) {
          console.error('Error inserting new report:', insertError);
        } else {
          successCount++;
          console.log(`Inserted new report for: ${row.ghost_name}`);
        }
      } else {
        console.log(`Skipped existing report for: ${row.ghost_name} (no force update)`);
      }
    }
    
    console.log(`Migration completed: ${successCount}/${reportRows.length} reports processed`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error; // Re-throw the error for the caller to handle
  }
}
