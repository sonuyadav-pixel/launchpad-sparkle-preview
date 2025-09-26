-- Create interview feedback tables
CREATE TABLE public.interview_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  overall_score DECIMAL(3,1) CHECK (overall_score >= 0 AND overall_score <= 10),
  communication_score DECIMAL(3,1) CHECK (communication_score >= 0 AND communication_score <= 10),
  body_language_score DECIMAL(3,1) CHECK (body_language_score >= 0 AND body_language_score <= 10),
  domain_knowledge_score DECIMAL(3,1) CHECK (domain_knowledge_score >= 0 AND domain_knowledge_score <= 10),
  confidence_score DECIMAL(3,1) CHECK (confidence_score >= 0 AND confidence_score <= 10),
  clarity_score DECIMAL(3,1) CHECK (clarity_score >= 0 AND clarity_score <= 10),
  analysis_summary TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
);

-- Create improvement suggestions table
CREATE TABLE public.improvement_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL,
  category TEXT NOT NULL, -- 'communication', 'technical', 'presentation', etc.
  suggestion TEXT NOT NULL,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5), -- 1 = highest priority
  is_premium BOOLEAN DEFAULT false, -- locked behind Interview+
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (feedback_id) REFERENCES interview_feedback(id) ON DELETE CASCADE
);

-- Enable RLS on feedback tables
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.improvement_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for interview_feedback
CREATE POLICY "Users can view their own interview feedback"
ON public.interview_feedback
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create interview feedback"
ON public.interview_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview feedback"
ON public.interview_feedback
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for improvement_suggestions
CREATE POLICY "Users can view suggestions for their feedback"
ON public.improvement_suggestions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM interview_feedback 
    WHERE interview_feedback.id = improvement_suggestions.feedback_id 
    AND interview_feedback.user_id = auth.uid()
  )
);

CREATE POLICY "System can create improvement suggestions"
ON public.improvement_suggestions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM interview_feedback 
    WHERE interview_feedback.id = improvement_suggestions.feedback_id 
    AND interview_feedback.user_id = auth.uid()
  )
);

-- Add indexes for performance
CREATE INDEX idx_interview_feedback_session_id ON interview_feedback(session_id);
CREATE INDEX idx_interview_feedback_user_id ON interview_feedback(user_id);
CREATE INDEX idx_improvement_suggestions_feedback_id ON improvement_suggestions(feedback_id);
CREATE INDEX idx_improvement_suggestions_category ON improvement_suggestions(category);

-- Trigger for updating updated_at
CREATE TRIGGER update_interview_feedback_updated_at
BEFORE UPDATE ON public.interview_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();