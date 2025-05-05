
import { supabase } from './supabase';

export const setupReportsTable = async (): Promise<void> => {
  try {
    console.log('Checking if reports table exists...');
    
    // Check if the table exists by querying it
    const { error: queryError } = await supabase
      .from('reports')
      .select('count')
      .limit(1);
    
    // If there's an error with code 42P01 or 404, the table doesn't exist
    // Note: Removed the status check as it doesn't exist on PostgrestError
    if (queryError && (queryError.code === '42P01' || queryError.code === '404')) {
      console.log('Reports table does not exist, creating it...');
      await createReportsTable();
    } else {
      console.log('Reports table already exists');
    }
  } catch (error) {
    console.error('Error checking reports table:', error);
    // Try to create the table anyway
    await createReportsTable();
  }
};

const createReportsTable = async (): Promise<void> => {
  try {
    console.log('Creating reports table directly...');
    
    // Instead of accessing protected properties, use environment variables or constants from our file
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zaktygshxiqitamkkvzx.supabase.co';
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpha3R5Z3NoeGlxaXRhbWtrdnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDY3OTEsImV4cCI6MjA2MTk4Mjc5MX0.CQ2I3GqPL0IfdlxjIhfEWjg-fkOo0Q06jJghPV2xsEY';
    
    // Use the REST API to create the table
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: 'reports',
        schema: 'public',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            primaryKey: true,
            default: 'uuid_generate_v4()'
          },
          {
            name: 'reporter_name',
            type: 'text',
            nullable: false
          },
          {
            name: 'reporter_email',
            type: 'text',
            nullable: false
          },
          {
            name: 'ghost_name',
            type: 'text',
            nullable: false
          },
          {
            name: 'company_name',
            type: 'text'
          },
          {
            name: 'ghost_photo_url',
            type: 'text',
            nullable: false
          },
          {
            name: 'date_ghosted',
            type: 'timestamp',
            nullable: false
          },
          {
            name: 'evidence_url',
            type: 'text',
            nullable: false
          },
          {
            name: 'venmo_handle',
            type: 'text'
          },
          {
            name: 'location',
            type: 'text'
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()'
          }
        ]
      })
    });
    
    if (response.ok) {
      console.log('Reports table created successfully');
    } else {
      const errorData = await response.json();
      console.error('Failed to create table:', errorData);
      
      // Alternative approach: try using SQL directly
      console.log('Attempting alternative method to create table...');
      
      // Try a simple SQL command instead of using the REST API
      const { error } = await supabase.rpc('create_reports_table', {});
      if (error) {
        console.error('Alternative table creation failed:', error);
        
        // Let's try a very simple query just to see if we can communicate with Supabase
        const { error: testError } = await supabase
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
          
        if (testError) {
          console.error('Even simple insert failed:', testError);
        } else {
          console.log('Simple insert worked - table might exist now!');
        }
      } else {
        console.log('Alternative table creation successful');
      }
    }
  } catch (error) {
    console.error('Error creating reports table:', error);
  }
};

// Initialize the database by ensuring the table exists
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('Initializing database...');
    
    // Set up the table
    await setupReportsTable();
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};
