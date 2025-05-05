
import { supabase } from '@/integrations/supabase/client';

export const setupReportsTable = async (): Promise<void> => {
  try {
    console.log('Checking if reports table exists...');
    
    // Check if the table exists by querying it
    const { error: queryError } = await supabase
      .from('reports')
      .select('count')
      .limit(1);
    
    // If there's an error with code 42P01, the table doesn't exist
    if (queryError && (queryError.code === '42P01' || queryError.code === '404')) {
      console.log('Reports table does not exist, creating it...');
      await createReportsTable();
    } else {
      console.log('Reports table already exists');
    }
  } catch (error) {
    console.error('Error checking reports table:', error);
  }
};

const createReportsTable = async (): Promise<void> => {
  try {
    console.log('Creating reports table...');
    
    // Use environment variables or hardcoded values as fallback
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zaktygshxiqitamkkvzx.supabase.co';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpha3R5Z3NoeGlxaXRhbWtrdnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDY3OTEsImV4cCI6MjA2MTk4Mjc5MX0.CQ2I3GqPL0IfdlxjIhfEWjg-fkOo0Q06jJghPV2xsEY';
    
    // Try using the SQL RPC function first
    // Fix: Change how we call the RPC function - use empty object instead of empty string
    const { error: rpcError } = await supabase.rpc('create_reports_table');
    
    if (!rpcError) {
      console.log('Reports table created successfully using RPC function');
      return;
    }
    
    console.log('RPC function failed or does not exist, trying direct insert...');
    
    // Try a simple insert as a fallback, which will either work if the table exists
    // or fail in a way that gives us useful information
    try {
      const { error: insertError } = await supabase
        .from('reports')
        .insert([
          { 
            reporter_name: 'Test User',
            reporter_email: 'test@example.com',
            ghost_name: 'Test Ghost',
            ghost_photo_url: 'https://example.com/photo.jpg',
            date_ghosted: new Date().toISOString(),
            evidence_url: 'https://example.com/evidence.pdf'
          }
        ]);
        
      if (insertError) {
        console.error('Insert test failed:', insertError);
        throw insertError;
      } else {
        console.log('Table exists and insert test was successful');
      }
    } catch (insertTestError) {
      console.error('Error during insert test:', insertTestError);
      throw insertTestError;
    }
  } catch (error) {
    console.error('Error creating reports table:', error);
    throw error;
  }
};

// Initialize the database by ensuring the table exists
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('Initializing database...');
    
    // Table is now created via SQL migration, so we'll just check if it exists
    const { count, error } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error checking reports table:', error);
    } else {
      console.log(`Reports table exists with ${count} records`);
    }
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};
