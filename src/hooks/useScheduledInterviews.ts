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
  invited_email: string;
  created_at: string;
  updated_at: string;
}

export const useScheduledInterviews = () => {
  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${session?.access_token}`,
    };
  };

  const fetchScheduledInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = await getAuthHeaders();
      const { data, error } = await supabase.functions.invoke('scheduled-interviews', {
        headers
      });

      if (error) throw error;

      setScheduledInterviews(data || []);
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

      const headers = await getAuthHeaders();
      const { data, error } = await supabase.functions.invoke('scheduled-interviews', {
        body: interview,
        headers
      });

      if (error) throw error;

      setScheduledInterviews(prev => [...prev, data]);
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

      // Since we can't pass method in invoke, we'll use a direct fetch call
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`https://ecrxtqvkncbbolmfqpxx.supabase.co/functions/v1/scheduled-interviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update interview');

      setScheduledInterviews(prev => prev.map(interview => 
        interview.id === id ? data : interview
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

      // Since we can't pass method in invoke, we'll use a direct fetch call
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`https://ecrxtqvkncbbolmfqpxx.supabase.co/functions/v1/scheduled-interviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${session?.access_token}`,
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete interview');

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