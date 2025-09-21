-- Create interview sessions table
CREATE TABLE public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'AI Interview Session',
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'paused', 'completed', 'cancelled')),
  interview_type TEXT NOT NULL DEFAULT 'general' CHECK (interview_type IN ('general', 'technical', 'behavioral', 'custom')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- Create interview transcript table for storing conversation
CREATE TABLE public.interview_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL CHECK (speaker IN ('user', 'ai')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_transcripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interview_sessions
CREATE POLICY "Users can view their own interview sessions"
ON public.interview_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview sessions"
ON public.interview_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview sessions"
ON public.interview_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for interview_transcripts
CREATE POLICY "Users can view transcripts of their own sessions"
ON public.interview_transcripts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.interview_sessions 
    WHERE id = interview_transcripts.session_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create transcripts for their own sessions"
ON public.interview_transcripts
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.interview_sessions 
    WHERE id = interview_transcripts.session_id 
    AND user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_status ON public.interview_sessions(status);
CREATE INDEX idx_interview_transcripts_session_id ON public.interview_transcripts(session_id);
CREATE INDEX idx_interview_transcripts_timestamp ON public.interview_transcripts(timestamp);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_transcripts;

-- Set replica identity for realtime
ALTER TABLE public.interview_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.interview_transcripts REPLICA IDENTITY FULL;

-- Create function to update session duration
CREATE OR REPLACE FUNCTION public.update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' OR NEW.status = 'cancelled' THEN
    NEW.ended_at = now();
    IF NEW.started_at IS NOT NULL THEN
      NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
    END IF;
  ELSIF NEW.status = 'active' AND OLD.status != 'active' THEN
    NEW.started_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for session duration updates
CREATE TRIGGER update_session_duration_trigger
  BEFORE UPDATE ON public.interview_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_duration();