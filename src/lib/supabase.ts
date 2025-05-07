
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
  // Generate a stock company image based on company name instead of using the user-provided photo URL
  const companyName = report.companyName || report.ghostName;
  const companyImageId = Math.abs(companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10) + 1;
  const stockImageId = [
    "photo-1487958449943-2429e8be8625",
    "photo-1518005020951-eccb494ad742",
    "photo-1496307653780-42ee777d4833",
    "photo-1431576901776-e539bd916ba2",
    "photo-1449157291145-7efd050a4d0e",
    "photo-1459767129954-1b1c1f9b9ace",
    "photo-1460574283810-2aab119d8511",
    "photo-1551038247-3d9af20df552",
    "photo-1524230572899-a752b3835840",
    "photo-1493397212122-2b85dda8106b"
  ][companyImageId - 1];
  
  const companyImageUrl = `https://images.unsplash.com/${stockImageId}?auto=format&fit=crop&w=300&h=300&q=80`;
  
  return {
    reporter_name: report.reporterName,
    reporter_email: report.reporterEmail,
    ghost_name: report.ghostName,
    company_name: report.companyName,
    ghost_photo_url: companyImageUrl, // Use the generated company image
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

// Function to migrate mock data to Supabase with updated company images
export async function migrateMockData(forceUpdate = true): Promise<void> {
  console.log("Starting migration of mock data to Supabase...");
  
  try {
    console.log("Proceeding with migration of all mock data...");
    
    // Convert mock reports to rows with company images
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
