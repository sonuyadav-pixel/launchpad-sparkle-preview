-- Create onboarding table to store user progress and data
CREATE TABLE public.user_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0,
  completed_steps INTEGER[] DEFAULT '{}',
  skipped_steps INTEGER[] DEFAULT '{}',
  
  -- Basic Information
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  
  -- Professional Summary
  headline TEXT,
  about_me TEXT,
  
  -- Current Role
  current_job_title TEXT,
  current_company TEXT,
  employment_type TEXT,
  current_role_start_date TEXT,
  current_role_end_date TEXT,
  is_current_role BOOLEAN DEFAULT true,
  key_responsibilities TEXT[],
  
  -- Work Experience
  total_years_experience TEXT,
  work_experience JSONB DEFAULT '[]',
  
  -- Education
  education JSONB DEFAULT '[]',
  
  -- Skills
  skills JSONB DEFAULT '{"technical":[],"soft":[],"tools":[],"frameworks":[]}',
  
  -- Certifications
  certifications JSONB DEFAULT '[]',
  
  -- Career Preferences
  desired_roles TEXT[],
  preferred_industries TEXT[],
  preferred_employment_type TEXT[],
  salary_range JSONB,
  preferred_locations TEXT[],
  
  -- Files
  resume_file_path TEXT,
  profile_photo_path TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own onboarding data"
ON public.user_onboarding
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding data"
ON public.user_onboarding
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding data"
ON public.user_onboarding
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_onboarding_updated_at
BEFORE UPDATE ON public.user_onboarding
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();