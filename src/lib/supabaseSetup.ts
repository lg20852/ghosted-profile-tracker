
import { supabase } from './supabase';

export const setupReportsTable = async (): Promise<void> => {
  try {
    console.log('Checking/creating reports table...');
    
    // Execute SQL to create the table if it doesn't exist
    const { error } = await supabase.rpc('create_reports_table_if_not_exists');
    
    if (error) {
      // If the RPC doesn't exist, we'll create the table directly
      console.log('RPC not found, creating table directly...');
      await createReportsTableDirectly();
    } else {
      console.log('Reports table setup completed via RPC');
    }
  } catch (error) {
    console.error('Error setting up reports table:', error);
    await createReportsTableDirectly();
  }
};

const createReportsTableDirectly = async (): Promise<void> => {
  try {
    // Check if the table exists
    const { data: tableExists } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('tablename', 'reports')
      .limit(1);

    // If table doesn't exist, create it
    if (!tableExists || tableExists.length === 0) {
      console.log('Creating reports table...');
      
      // Create the table with the schema matching ReportRow type
      const { error } = await supabase.rpc(
        'create_reports_table',
        {}
      );
      
      if (error) {
        console.error('Error creating reports table via RPC:', error);
        
        // As a fallback, use a raw SQL query (using the proper method)
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS reports (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            reporter_name TEXT NOT NULL,
            reporter_email TEXT NOT NULL,
            ghost_name TEXT NOT NULL,
            company_name TEXT,
            ghost_photo_url TEXT NOT NULL,
            date_ghosted TIMESTAMP NOT NULL,
            evidence_url TEXT NOT NULL,
            venmo_handle TEXT,
            location TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
        `;
        
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: createTableSQL });
        
        if (sqlError) {
          throw sqlError;
        }
        
        console.log('Reports table created successfully via direct SQL');
      } else {
        console.log('Reports table created successfully via RPC');
      }
    } else {
      console.log('Reports table already exists');
    }
  } catch (error) {
    console.error('Failed to create reports table directly:', error);
    throw error;
  }
};

// Function to check for required database functions and create them if needed
export const setupDatabaseFunctions = async (): Promise<void> => {
  try {
    console.log('Setting up database functions...');
    
    // Create functions for table creation
    const createTableFunctionSQL = `
    CREATE OR REPLACE FUNCTION create_reports_table()
    RETURNS VOID AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        reporter_name TEXT NOT NULL,
        reporter_email TEXT NOT NULL,
        ghost_name TEXT NOT NULL,
        company_name TEXT,
        ghost_photo_url TEXT NOT NULL,
        date_ghosted TIMESTAMP NOT NULL,
        evidence_url TEXT NOT NULL,
        venmo_handle TEXT,
        location TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    CREATE OR REPLACE FUNCTION create_reports_table_if_not_exists()
    RETURNS VOID AS $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reports'
      ) THEN
        PERFORM create_reports_table();
      END IF;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
    RETURNS VOID AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // This will likely fail in most cases due to permission issues, but we'll try
    // using a better approach for executing SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: createTableFunctionSQL });
    
    if (error) {
      console.warn('Could not create database functions (this is expected if you do not have admin privileges):', error);
    } else {
      console.log('Database functions created successfully');
    }
  } catch (error) {
    console.warn('Error setting up database functions (this might be expected):', error);
  }
};

// Initialize the database by ensuring the table exists
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('Initializing database...');
    
    // First try to set up functions (may fail due to permissions)
    await setupDatabaseFunctions().catch(error => {
      console.warn('Setting up functions failed (expected for non-admin users):', error);
    });
    
    // Then set up the table
    await setupReportsTable();
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};
