-- Create scheduled_interviews table for calendar functionality
CREATE TABLE public.scheduled_interviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  candidate_name text NOT NULL,
  interview_title text NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled', 'missed')),
  session_id uuid REFERENCES public.interview_sessions(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_interviews ENABLE ROW LEVEL SECURITY;

-- Create policies for scheduled_interviews
CREATE POLICY "Users can view their own scheduled interviews" 
ON public.scheduled_interviews 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled interviews" 
ON public.scheduled_interviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled interviews" 
ON public.scheduled_interviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled interviews" 
ON public.scheduled_interviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on scheduled_interviews
CREATE TRIGGER update_scheduled_interviews_updated_at
BEFORE UPDATE ON public.scheduled_interviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();