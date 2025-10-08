import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ScheduledInterview {
  id: string;
  user_id: string;
  candidate_name: string;
  interview_title: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'missed' | 'no-show';
  session_id?: string;
  invited_email: string;
  cv_file_path?: string;
  jd_file_path?: string;
  created_at: string;
  updated_at: string;
  attempts_count: number;
  max_attempts: number;
}

export const useScheduledInterviews = () => {
  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchScheduledInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('scheduled-interviews', {
        method: 'GET'
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

  const createScheduledInterview = useCallback(async (
    interview: Omit<ScheduledInterview, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    cvFile?: File,
    jdFile?: File
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!session?.access_token || !user) {
        throw new Error('Not authenticated');
      }

      let cvPath = null;
      let jdPath = null;

      // Upload CV to Supabase storage
      if (cvFile) {
        const cvFilename = `${user.id}/${Date.now()}_${cvFile.name}`;
        const { error: cvUploadError } = await supabase.storage
          .from('interview-cvs')
          .upload(cvFilename, cvFile);

        if (cvUploadError) {
          throw new Error(`CV upload failed: ${cvUploadError.message}`);
        }
        cvPath = cvFilename;

        // Upload CV to EC2 in background
        supabase.functions.invoke('upload-to-ec2', {
          body: { filePath: cvFilename, role: 'cv', bucket: 'interview-cvs' },
        }).catch(err => console.error('EC2 CV upload error:', err));
      }

      // Upload JD to Supabase storage
      if (jdFile) {
        const jdFilename = `${user.id}/${Date.now()}_${jdFile.name}`;
        const { error: jdUploadError } = await supabase.storage
          .from('interview-jds')
          .upload(jdFilename, jdFile);

        if (jdUploadError) {
          throw new Error(`JD upload failed: ${jdUploadError.message}`);
        }
        jdPath = jdFilename;

        // Upload JD to EC2 in background
        supabase.functions.invoke('upload-to-ec2', {
          body: { filePath: jdFilename, role: 'jd', bucket: 'interview-jds' },
        }).catch(err => console.error('EC2 JD upload error:', err));
      }

      // Create interview with file paths
      const { data, error } = await supabase.functions.invoke('scheduled-interviews', {
        body: {
          ...interview,
          cv_file_path: cvPath,
          jd_file_path: jdPath,
        },
        method: 'POST'
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

      // Update directly in Supabase table
      const { data, error } = await supabase
        .from('scheduled_interviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedInterview = data as ScheduledInterview;

      setScheduledInterviews(prev => prev.map(interview => 
        interview.id === id ? updatedInterview : interview
      ));

      return updatedInterview;
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
    return scheduledInterviews.find(interview => {
      const scheduledTime = new Date(interview.scheduled_at);
      const hasAttemptsRemaining = interview.attempts_count < interview.max_attempts;
      const isScheduledInFuture = scheduledTime > now;
      
      return interview.status === 'scheduled' && 
             hasAttemptsRemaining && 
             isScheduledInFuture;
    });
  }, [scheduledInterviews]);
  
  const incrementAttempts = useCallback(async (id: string) => {
    try {
      const interview = scheduledInterviews.find(i => i.id === id);
      if (!interview) return;
      
      const newAttemptsCount = interview.attempts_count + 1;
      
      await updateScheduledInterview(id, {
        attempts_count: newAttemptsCount
      });
      
      return newAttemptsCount;
    } catch (err: any) {
      console.error('Error incrementing attempts:', err);
      throw err;
    }
  }, [scheduledInterviews, updateScheduledInterview]);

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
    getInterviewsForDate,
    incrementAttempts
  };
};