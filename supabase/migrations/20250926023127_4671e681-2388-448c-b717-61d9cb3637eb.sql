-- Enable real-time updates for interview_feedback table
ALTER TABLE public.interview_feedback REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_feedback;

-- Also enable real-time for improvement_suggestions
ALTER TABLE public.improvement_suggestions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.improvement_suggestions;