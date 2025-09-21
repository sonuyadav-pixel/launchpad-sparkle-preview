import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InterviewSession {
  id: string;
  user_id: string;
  title: string;
  status: 'waiting' | 'active' | 'paused' | 'completed' | 'cancelled';
  interview_type: 'general' | 'technical' | 'behavioral' | 'custom';
  created_at: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds: number;
  settings: any;
  metadata: any;
}

export interface TranscriptMessage {
  id: string;
  session_id: string;
  speaker: 'user' | 'ai';
  message: string;
  timestamp: string;
  metadata: any;
}

export const useInterviewSession = () => {
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create new interview session
  const createSession = useCallback(async (sessionData: {
    title?: string;
    interview_type?: string;
    settings?: any;
    metadata?: any;
  }) => {
    try {
      setLoading(true);
      setError("");
      console.log('createSession called with:', sessionData);
      const { data: { session: authSession }, error: sessionError } = await supabase.auth.getSession();
      console.log('Auth session check:', { 
        hasSession: !!authSession, 
        hasAccessToken: !!authSession?.access_token,
        hasUser: !!authSession?.user,
        error: sessionError 
      });
      
      if (!authSession?.access_token || !authSession?.user) {
        console.error('Authentication failed:', { authSession, sessionError });
        throw new Error('Not authenticated - please log in first');
      }

      console.log('Creating session with data:', sessionData);
      console.log('Auth token available:', !!authSession.access_token);

      const { data, error } = await supabase.functions.invoke('interview-session', {
        body: {
          action: 'create',
          ...sessionData
        },
        headers: {
          Authorization: `Bearer ${authSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.session) {
        throw new Error('Invalid response from server');
      }

      const newSession = data.session;
      setCurrentSession(newSession);
      setSessions(prev => [newSession, ...prev]);

      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      setError(`Failed to create interview session: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update session status
  const updateSession = useCallback(async (sessionId: string, updates: Partial<InterviewSession>) => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.access_token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('interview-session', {
        body: {
          action: 'update',
          session_id: sessionId,
          ...updates
        },
        headers: {
          Authorization: `Bearer ${authSession.access_token}`
        }
      });

      if (error) throw error;

      const updatedSession = data.session;
      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));

      return updatedSession;
    } catch (error) {
      console.error('Error updating session:', error);
      setError("Failed to update interview session.");
      throw error;
    }
  }, []);

  // Get sessions for current user
  const getSessions = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.access_token) {
        throw new Error('Not authenticated');
      }

      const url = new URL(`https://ecrxtqvkncbbolmfqpxx.functions.supabase.co/interview-session`);
      url.searchParams.set('action', 'get');
      if (status) {
        url.searchParams.set('status', status);
      }

      const { data, error } = await supabase.functions.invoke('interview-session', {
        body: null,
        headers: {
          Authorization: `Bearer ${authSession.access_token}`
        }
      });

      if (error) throw error;

      setSessions(data.sessions || []);
      return data.sessions || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError("Failed to load interview sessions.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Join existing session
  const joinSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.access_token) {
        throw new Error('Not authenticated');
      }

      const url = new URL(`https://ecrxtqvkncbbolmfqpxx.functions.supabase.co/interview-session`);
      url.searchParams.set('action', 'get');
      url.searchParams.set('session_id', sessionId);

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${authSession.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }

      const { session } = await response.json();
      setCurrentSession(session);

      // Load transcript for the session
      await getTranscript(sessionId);

      return session;
    } catch (error) {
      console.error('Error joining session:', error);
      setError("Failed to join interview session.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add transcript message
  const addTranscriptMessage = useCallback(async (sessionId: string, speaker: 'user' | 'ai', message: string, metadata?: any) => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.access_token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('interview-session', {
        body: {
          action: 'add-transcript',
          session_id: sessionId,
          speaker,
          message,
          metadata
        },
        headers: {
          Authorization: `Bearer ${authSession.access_token}`
        }
      });

      if (error) throw error;

      const newTranscript = data.transcript;
      setTranscripts(prev => [...prev, newTranscript]);

      return newTranscript;
    } catch (error) {
      console.error('Error adding transcript:', error);
      throw error;
    }
  }, []);

  // Get transcript for session
  const getTranscript = useCallback(async (sessionId: string) => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.access_token) {
        throw new Error('Not authenticated');
      }

      const url = new URL(`https://ecrxtqvkncbbolmfqpxx.functions.supabase.co/interview-session`);
      url.searchParams.set('action', 'get-transcript');
      url.searchParams.set('session_id', sessionId);

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${authSession.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }

      const { transcripts: sessionTranscripts } = await response.json();
      setTranscripts(sessionTranscripts || []);

      return sessionTranscripts || [];
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return [];
    }
  }, []);

  // Real-time subscription for session updates
  useEffect(() => {
    if (!currentSession) return;

    const channel = supabase
      .channel('session-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'interview_sessions',
          filter: `id=eq.${currentSession.id}`
        },
        (payload) => {
          console.log('Session updated:', payload.new);
          setCurrentSession(payload.new as InterviewSession);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interview_transcripts',
          filter: `session_id=eq.${currentSession.id}`
        },
        (payload) => {
          console.log('New transcript message:', payload.new);
          setTranscripts(prev => [...prev, payload.new as TranscriptMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSession?.id]);

  return {
    currentSession,
    sessions,
    transcripts,
    loading,
    error,
    setError,
    createSession,
    updateSession,
    getSessions,
    joinSession,
    addTranscriptMessage,
    getTranscript,
    setCurrentSession,
    setTranscripts
  };
};