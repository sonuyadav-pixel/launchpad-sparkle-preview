import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InterviewFeedback {
  id: string;
  session_id: string;
  user_id: string;
  overall_score: number;
  communication_score: number;
  body_language_score: number;
  domain_knowledge_score: number;
  confidence_score: number;
  clarity_score: number;
  analysis_summary: string;
  strengths: string[];
  weaknesses: string[];
  generated_at: string;
}

export interface ImprovementSuggestion {
  id: string;
  feedback_id: string;
  category: string;
  suggestion: string;
  priority: number;
  is_premium: boolean;
}

export function useInterviewFeedback() {
  const [feedbacks, setFeedbacks] = useState<InterviewFeedback[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<InterviewFeedback | null>(null);
  const [suggestions, setSuggestions] = useState<ImprovementSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFeedback = async (sessionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: feedback, error: feedbackError } = await supabase
        .from('interview_feedback')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (feedbackError) {
        if (feedbackError.code === 'PGRST116') {
          // No feedback found
          setCurrentFeedback(null);
          setSuggestions([]);
          return null;
        }
        throw feedbackError;
      }

      setCurrentFeedback(feedback);

      // Fetch improvement suggestions
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('improvement_suggestions')
        .select('*')
        .eq('feedback_id', feedback.id)
        .order('priority', { ascending: true });

      if (suggestionsError) {
        console.error('Error fetching suggestions:', suggestionsError);
      } else {
        setSuggestions(suggestionsData || []);
      }

      return feedback;
    } catch (err: any) {
      console.error('Error fetching feedback:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateFeedback = async (sessionId: string) => {
    setGenerating(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-feedback', {
        body: { session_id: sessionId }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Feedback Generated",
        description: "Your interview feedback is ready!",
      });

      // Fetch the newly generated feedback
      await fetchFeedback(sessionId);

      return data;
    } catch (err: any) {
      console.error('Error generating feedback:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to generate feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const fetchAllFeedbacks = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('interview_feedback')
        .select(`
          *,
          interview_sessions(title, created_at, interview_type)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setFeedbacks(data || []);
    } catch (err: any) {
      console.error('Error fetching all feedbacks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentFeedback = () => {
    setCurrentFeedback(null);
    setSuggestions([]);
  };

  return {
    feedbacks,
    currentFeedback,
    suggestions,
    loading,
    generating,
    error,
    fetchFeedback,
    generateFeedback,
    fetchAllFeedbacks,
    clearCurrentFeedback,
  };
}