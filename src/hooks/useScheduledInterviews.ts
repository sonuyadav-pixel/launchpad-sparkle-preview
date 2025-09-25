import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ScheduledInterview {
  id: string;
  user_id: string;
  candidate_name: string;
  interview_title: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'missed';
  session_id?: string;
  created_at: string;
  updated_at: string;
}

export const useScheduledInterviews = () => {
  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduledInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('scheduled_interviews')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      setScheduledInterviews((data as ScheduledInterview[]) || []);
    } catch (err: any) {
      console.error('Error fetching scheduled interviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createScheduledInterview = useCallback(async (interview: Omit<ScheduledInterview, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('scheduled_interviews')
        .insert([{
          ...interview,
          user_id: user.user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setScheduledInterviews(prev => [...prev, data as ScheduledInterview]);
      return data;
    } catch (err: any) {
      console.error('Error creating scheduled interview:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateScheduledInterview = useCallback(async (id: string, updates: Partial<ScheduledInterview>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('scheduled_interviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setScheduledInterviews(prev => prev.map(interview => 
        interview.id === id ? (data as ScheduledInterview) : interview
      ));

      return data;
    } catch (err: any) {
      console.error('Error updating scheduled interview:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteScheduledInterview = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('scheduled_interviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setScheduledInterviews(prev => prev.filter(interview => interview.id !== id));
    } catch (err: any) {
      console.error('Error deleting scheduled interview:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUpcomingInterview = useCallback(() => {
    const now = new Date();
    return scheduledInterviews.find(interview => 
      interview.status === 'scheduled' && 
      new Date(interview.scheduled_at) > now
    );
  }, [scheduledInterviews]);

  const getInterviewsForDate = useCallback((date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return scheduledInterviews.filter(interview => {
      const interviewDate = new Date(interview.scheduled_at);
      return interviewDate >= startOfDay && interviewDate <= endOfDay;
    });
  }, [scheduledInterviews]);

  useEffect(() => {
    fetchScheduledInterviews();
  }, [fetchScheduledInterviews]);

  return {
    scheduledInterviews,
    loading,
    error,
    fetchScheduledInterviews,
    createScheduledInterview,
    updateScheduledInterview,
    deleteScheduledInterview,
    getUpcomingInterview,
    getInterviewsForDate
  };
};