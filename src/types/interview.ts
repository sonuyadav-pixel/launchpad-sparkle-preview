export type InterviewSessionStatus = 
  | 'waiting'
  | 'active' 
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'abandoned';

export interface InterviewSession {
  id: string;
  user_id: string;
  title: string;
  status: InterviewSessionStatus;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  interview_type: string;
  settings?: any;
  metadata?: any;
  created_at: string;
}

export interface InterviewTranscript {
  id: string;
  session_id: string;
  speaker: string;
  message: string;
  timestamp: string;
  metadata?: any;
}