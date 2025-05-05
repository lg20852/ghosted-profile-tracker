
import { supabase } from './supabase';

export const setupReportsTable = async (): Promise<void> => {
  try {
    console.log('Checking if reports table exists...');
    
    // Check if the table exists by querying it
    const { error: queryError } = await supabase
      .from('reports')
      .select('count')
      .limit(1);
    
    // If there's a 404/422 error, the table doesn't exist
    if (queryError && (queryError.code === '42P01' || queryError.code === '404' || queryError.status === 404)) {
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
    console.log('Creating reports table directly with Supabase API...');
    
    // Use the REST API to create the table
    const response = await fetch(`${supabase.supabaseUrl}/rest/v1/?apikey=${supabase.supabaseKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`,
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
