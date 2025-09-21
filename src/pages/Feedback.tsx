import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Clock, Calendar, MessageSquare, User, Bot } from 'lucide-react';

interface InterviewSession {
  id: string;
  title: string;
  status: string;
  interview_type: string;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
}

interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'ai';
  message: string;
  timestamp: string;
}

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviewSessions();
  }, []);

  const fetchInterviewSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('interview-session', {
        body: {
          action: 'get-user-sessions',
          user_id: user.id
        }
      });

      if (error) throw error;

      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load interview sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTranscript = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('interview-session', {
        body: {
          action: 'get-transcript',
          session_id: sessionId
        }
      });

      if (error) throw error;

      setTranscript(data.transcript || []);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      toast({
        title: "Error",
        description: "Failed to load interview transcript",
        variant: "destructive"
      });
    }
  };

  const handleSessionSelect = (session: InterviewSession) => {
    setSelectedSession(session);
    fetchTranscript(session.id);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Interview Feedback & History</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Past Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {sessions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No interviews found. Start your first interview!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <Card
                          key={session.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedSession?.id === session.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => handleSessionSelect(session)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                                {session.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(session.created_at)}
                              </span>
                            </div>
                            <h3 className="font-medium mb-1">{session.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {session.duration_seconds > 0 ? formatDuration(session.duration_seconds) : 'N/A'}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Session Details */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="space-y-6">
                {/* Session Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge variant={selectedSession.status === 'completed' ? 'default' : 'secondary'}>
                          {selectedSession.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Duration</p>
                        <p className="font-medium">
                          {selectedSession.duration_seconds > 0 ? formatDuration(selectedSession.duration_seconds) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Started</p>
                        <p className="font-medium">
                          {selectedSession.started_at ? formatDate(selectedSession.started_at) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ended</p>
                        <p className="font-medium">
                          {selectedSession.ended_at ? formatDate(selectedSession.ended_at) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Transcript */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Interview Transcript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      {transcript.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No transcript available for this interview.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {transcript.map((message) => (
                            <div
                              key={message.id}
                              className={`flex gap-3 ${
                                message.speaker === 'user' ? 'flex-row-reverse' : ''
                              }`}
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                message.speaker === 'user' 
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary text-secondary-foreground'
                              }`}>
                                {message.speaker === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                              </div>
                              <div className={`flex-1 max-w-[80%] ${
                                message.speaker === 'user' ? 'text-right' : ''
                              }`}>
                                <div className={`rounded-lg p-3 ${
                                  message.speaker === 'user'
                                    ? 'bg-primary text-primary-foreground ml-auto'
                                    : 'bg-muted'
                                }`}>
                                  <p className="text-sm">{message.message}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select an Interview</h3>
                    <p className="text-muted-foreground">
                      Choose an interview from the left to view its details and transcript.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;