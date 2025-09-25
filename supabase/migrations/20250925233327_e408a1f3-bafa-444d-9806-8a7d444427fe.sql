-- Fix the RLS policy to avoid querying auth.users directly
-- Drop the problematic policy first
DROP POLICY IF EXISTS "Users can view interviews they are invited to" ON public.scheduled_interviews;

-- Create a security definer function to get user email safely
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create new policy using the security definer function
CREATE POLICY "Users can view interviews they are invited to" 
ON public.scheduled_interviews 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (invited_email IS NOT NULL AND invited_email = public.get_current_user_email())
);