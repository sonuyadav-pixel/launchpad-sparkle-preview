-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Create table for parsed resume data
CREATE TABLE public.parsed_resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  parsed_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parsed_resumes ENABLE ROW LEVEL SECURITY;

-- Create policies for parsed_resumes
CREATE POLICY "Users can view their own parsed resumes" 
ON public.parsed_resumes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own parsed resumes" 
ON public.parsed_resumes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parsed resumes" 
ON public.parsed_resumes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own parsed resumes" 
ON public.parsed_resumes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage policies for resume uploads
CREATE POLICY "Users can upload their own resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own resumes" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own resumes" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create trigger for timestamps
CREATE TRIGGER update_parsed_resumes_updated_at
BEFORE UPDATE ON public.parsed_resumes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();