// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zaktygshxiqitamkkvzx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpha3R5Z3NoeGlxaXRhbWtrdnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDY3OTEsImV4cCI6MjA2MTk4Mjc5MX0.CQ2I3GqPL0IfdlxjIhfEWjg-fkOo0Q06jJghPV2xsEY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);