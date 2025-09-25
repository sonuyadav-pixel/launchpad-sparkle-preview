import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Clock, Calendar, User, MessageSquare, Grid3X3, List, Trophy, TrendingUp, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { format } from 'date-fns';

interface InterviewSession {
  id: string;
  title: string;
  status: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  interview_type: string;
}

interface TranscriptMessage {
  id: string;
  speaker: string;
  message: string;
  timestamp: string;
}

const History = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useUserProfile();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Check if viewing a specific session from URL
  const sessionId = searchParams.get('session');

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  useEffect(() => {
    if (sessionId && sessions.length > 0) {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        handleSessionClick(session);
      }
    }
  }, [sessionId, sessions]);

  const fetchInterviewHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching interview history:', error);
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching interview history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTranscript = async (sessionId: string) => {
    setTranscriptLoading(true);
    try {
      const { data, error } = await supabase
        .from('interview_transcripts')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching transcript:', error);
        return;
      }

      setTranscript(data || []);
    } catch (error) {
      console.error('Error fetching transcript:', error);
    } finally {
      setTranscriptLoading(false);
    }
  };

  const handleSessionClick = async (session: InterviewSession) => {
    setSelectedSession(session);
    await fetchTranscript(session.id);
    // Update URL to include session ID
    navigate(`/history?session=${session.id}`, { replace: true });
  };

  const handleBackClick = () => {
    if (selectedSession) {
      setSelectedSession(null);
      setTranscript([]);
      navigate('/history', { replace: true });
    } else {
      navigate('/dashboard');
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Interview History</h1>
          </div>
          <div className="text-center py-8">
            <div className="text-lg">Loading your interview history...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {selectedSession ? 'Interview Details' : 'Interview History'}
          </h1>
        </div>

        {!selectedSession ? (
          // History View
          <div>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Interviews</p>
                      <p className="text-2xl font-bold">{sessions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Minutes</p>
                      <p className="text-2xl font-bold">
                        {Math.round(sessions.reduce((total, session) => total + (session.duration_seconds || 0), 0) / 60)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Feedback</p>
                      <p className="text-2xl font-bold">-</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                {sessions.length} interview{sessions.length !== 1 ? 's' : ''} found
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex items-center gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  List
                </Button>
              </div>
            </div>
            {sessions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Interviews Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your first AI interview to see your history here.
                  </p>
                  <Button onClick={() => navigate('/dashboard')}>
                    Start Interview
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {sessions.map((session) => (
                  <Card 
                    key={session.id}
                    className="group cursor-pointer relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 hover:bg-primary/5 border-2 hover:border-primary/60 border-border"
                    onClick={() => handleSessionClick(session)}
                  >
                    {/* Content with blur effect on hover */}
                    <div className="group-hover:blur-sm transition-all duration-300">
                      <CardHeader className="pb-2 relative z-20">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors duration-300">
                            {session.title}
                          </CardTitle>
                          <Badge className={`text-xs ${getStatusColor(session.status)} group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300`}>
                            {session.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 relative z-20">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary/80 transition-colors duration-300">
                          <User className="h-3 w-3" />
                          <span>{profile?.first_name || 'You'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary/80 transition-colors duration-300">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(session.created_at), 'MMM dd')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary/80 transition-colors duration-300">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(session.duration_seconds)}</span>
                        </div>
                        
                        <div className="pt-1">
                          <Badge variant="outline" className="text-xs group-hover:border-primary/50 group-hover:text-primary/80 transition-colors duration-300">
                            {session.interview_type}
                          </Badge>
                        </div>
                      </CardContent>
                    </div>

                    {/* Bottom CTA Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 flex justify-center">
                      <Button 
                        size="sm" 
                        className="bg-primary text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Explore
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card 
                    key={session.id}
                    className="group cursor-pointer relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 hover:bg-primary/5 border-2 hover:border-primary/60 border-border"
                    onClick={() => handleSessionClick(session)}
                  >
                    {/* Content with blur effect on hover */}
                    <div className="group-hover:blur-sm transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium group-hover:text-primary transition-colors duration-300">{session.title}</h3>
                              <Badge className={`text-xs ${getStatusColor(session.status)} group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300`}>
                                {session.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs group-hover:border-primary/50 group-hover:text-primary/80 transition-colors duration-300">
                                {session.interview_type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground group-hover:text-primary/80 transition-colors duration-300">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{profile?.first_name || 'You'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(session.created_at), 'MMM dd, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(session.duration_seconds)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-muted-foreground group-hover:text-primary/60 transition-colors duration-300">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    {/* Right CTA Overlay */}
                    <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center pr-4">
                      <Button 
                        size="sm" 
                        className="bg-primary text-white shadow-lg transform translate-x-4 group-hover:translate-x-0 transition-all duration-300"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Explore
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Transcript Detail View
          <div className="space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedSession.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(selectedSession.created_at), 'MMMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(selectedSession.duration_seconds)}
                      </div>
                      <Badge className={getStatusColor(selectedSession.status)}>
                        {selectedSession.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
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
                <ScrollArea className="h-96">
                  {transcriptLoading ? (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">Loading transcript...</div>
                    </div>
                  ) : transcript.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">No transcript available for this interview.</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transcript.map((message) => (
                        <div key={message.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={message.speaker === 'user' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {message.speaker === 'user' ? 'You' : 'AI Interviewer'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(message.timestamp), 'HH:mm:ss')}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed pl-4 border-l-2 border-muted">
                            {message.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;