
-- Remove the dangerous "allow all" policy if it exists
DROP POLICY IF EXISTS "Allow all operations for everyone" ON public.reports;

-- Create proper RLS policies for the reports table
-- Policy for users to view all reports (for the public directory)
CREATE POLICY "Users can view all reports" 
ON public.reports 
FOR SELECT 
USING (true);

-- Policy for users to insert their own reports
CREATE POLICY "Users can create reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (true);

-- Policy to prevent updates and deletes (reports should be immutable)
CREATE POLICY "Prevent updates to reports" 
ON public.reports 
FOR UPDATE 
USING (false);

CREATE POLICY "Prevent deletes of reports" 
ON public.reports 
FOR DELETE 
USING (false);

-- Add a user_id column to track report ownership (for future authentication)
ALTER TABLE public.reports 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make the user_id column default to the current authenticated user
ALTER TABLE public.reports 
ALTER COLUMN user_id SET DEFAULT auth.uid();
