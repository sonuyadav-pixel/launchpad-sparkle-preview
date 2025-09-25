import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InterviewSession, InterviewTranscript } from '@/types/interview';

export const useInterviewHistory = () => {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${session?.access_token}`,
    };
  };

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = await getAuthHeaders();
      const { data, error } = await supabase.functions.invoke('interview-history', {
        headers
      });

      if (error) throw error;

      setSessions(data || []);
    } catch (err: any) {
      console.error('Error fetching interview sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (session: Omit<InterviewSession, 'id' | 'user_id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const headers = await getAuthHeaders();
      const { data, error } = await supabase.functions.invoke('interview-history', {
        body: { ...session, resource: 'sessions' },
        headers
      });

      if (error) throw error;

      setSessions(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error creating session:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSession = useCallback(async (id: string, updates: Partial<InterviewSession>) => {
    try {
      setLoading(true);
      setError(null);

      // Since we can't pass method in invoke, we'll use a direct fetch call
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`https://ecrxtqvkncbbolmfqpxx.supabase.co/functions/v1/interview-history/sessions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update session');

      setSessions(prev => prev.map(session => 
        session.id === id ? data : session
      ));

      return data;
    } catch (err: any) {
      console.error('Error updating session:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessionWithTranscripts = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Since we can't pass method in invoke, we'll use a direct fetch call
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`https://ecrxtqvkncbbolmfqpxx.supabase.co/functions/v1/interview-history/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${session?.access_token}`,
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch session');

      return data;
    } catch (err: any) {
      console.error('Error fetching session with transcripts:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTranscript = useCallback(async (transcript: Omit<InterviewTranscript, 'id' | 'timestamp'>) => {
    try {
      const headers = await getAuthHeaders();
      const { data, error } = await supabase.functions.invoke('interview-history', {
        body: { ...transcript, resource: 'transcripts' },
        headers
      });

      if (error) throw error;

      return data;
    } catch (err: any) {
      console.error('Error creating transcript:', err);
      throw err;
    }
  }, []);

  const getTranscripts = useCallback(async (sessionId: string) => {
    try {
      // Since we can't pass method in invoke, we'll use a direct fetch call
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`https://ecrxtqvkncbbolmfqpxx.supabase.co/functions/v1/interview-history/transcripts?session_id=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${session?.access_token}`,
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch transcripts');

      return data || [];
    } catch (err: any) {
      console.error('Error fetching transcripts:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    getSessionWithTranscripts,
    createTranscript,
    getTranscripts
  };
};