-- Add role and position fields to interview_sessions table for better interview tracking
ALTER TABLE public.interview_sessions ADD COLUMN IF NOT EXISTS role_applied text;
ALTER TABLE public.interview_sessions ADD COLUMN IF NOT EXISTS company_name text;

-- Update the table to have better default values for new columns
UPDATE public.interview_sessions 
SET role_applied = 'Software Engineer' 
WHERE role_applied IS NULL;

UPDATE public.interview_sessions 
SET company_name = 'Tech Company' 
WHERE company_name IS NULL;