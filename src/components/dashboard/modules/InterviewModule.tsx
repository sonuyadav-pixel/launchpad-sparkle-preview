import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Users, Calendar, Clock, Play, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInterviewSession, type InterviewSession } from "@/hooks/useInterviewSession";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const InterviewModule = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    sessions,
    loading,
    getSessions,
    createSession,
    updateSession
  } = useInterviewSession();

  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);

  useEffect(() => {
    // Load user's sessions on component mount
    getSessions();
  }, [getSessions]);

  useEffect(() => {
    // Find any active session
    const active = sessions.find(session => 
      session.status === 'active' || session.status === 'waiting'
    );
    setActiveSession(active || null);
  }, [sessions]);

  const handleStartNewInterview = async () => {
    try {
      console.log('Starting new interview...');
      
      // Test edge function connectivity first
      try {
        const testResponse = await supabase.functions.invoke('test-function');
        console.log('Test function response:', testResponse);
      } catch (testError) {
        console.error('Test function failed:', testError);
      }
      
      const session = await createSession({
        title: `Interview Session - ${new Date().toLocaleDateString()}`,
        interview_type: 'general'
      });
      
      console.log('Session created successfully:', session);
      
      // Navigate to interview page with session ID
      navigate(`/interview?session=${session.id}`);
    } catch (error) {
      console.error('Failed to start interview:', error);
      
      toast({
        title: "Error",
        description: `Failed to start interview: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleJoinActiveSession = async () => {
    if (!activeSession) return;
    
    try {
      // Update session status to active if it's waiting
      if (activeSession.status === 'waiting') {
        await updateSession(activeSession.id, { status: 'active' });
      }
      
      // Navigate to interview page with session ID
      navigate(`/interview?session=${activeSession.id}`);
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'paused': return 'bg-orange-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDuration = (seconds: number) => {
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

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <CardTitle>AI Interview</CardTitle>
          </div>
          {activeSession && (
            <Badge className={`${getStatusColor(activeSession.status)} text-white`}>
              {activeSession.status.toUpperCase()}
            </Badge>
          )}
        </div>
        <CardDescription>
          Practice interviews with AI-powered feedback and analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Session - Prominent Display */}
        {activeSession ? (
          <div className="space-y-4">
            {/* Main Rejoin CTA */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className={`${getStatusColor(activeSession.status)} w-3 h-3 rounded-full mr-2 animate-pulse`}></div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  {activeSession.status === 'active' ? 'Interview in Progress' : 'Interview Ready'}
                </h3>
              </div>
              <p className="text-green-700 dark:text-green-300 mb-4">
                {activeSession.title}
              </p>
              <div className="flex items-center justify-center gap-2 mb-4 text-sm text-green-600 dark:text-green-400">
                <Calendar className="h-4 w-4" />
                <span>{new Date(activeSession.created_at).toLocaleDateString()}</span>
                {activeSession.duration_seconds > 0 && (
                  <>
                    <span>•</span>
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(activeSession.duration_seconds)}</span>
                  </>
                )}
              </div>
              
              {/* Primary Action */}
              <Button 
                size="lg" 
                onClick={handleJoinActiveSession}
                className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                {activeSession.status === 'active' ? 'Rejoin Interview' : 'Continue Interview'}
              </Button>
              
              {/* Secondary Action */}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleStartNewInterview}
                className="w-full border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300"
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                Start New Interview Instead
              </Button>
            </div>
            
            {/* Session Details */}
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground text-center">
                Session ID: {activeSession.id.slice(0, 8)}... • 
                Status: <span className="font-medium">{activeSession.status}</span>
              </p>
            </div>
          </div>
        ) : (
          /* No Active Session - Start New */
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
              <Video className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Ready to Practice?</h3>
              <p className="text-muted-foreground mb-4">
                Start your AI interview session and get personalized feedback
              </p>
              <Button 
                onClick={handleStartNewInterview} 
                size="lg"
                className="w-full"
                disabled={loading}
              >
                <Video className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Start New Interview'}
              </Button>
            </div>
          </div>
        )}

        {/* Recent Sessions - Only show if there are completed sessions */}
        {sessions.filter(s => s.status === 'completed').length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Recent Sessions</h4>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sessions.filter(s => s.status === 'completed').slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{session.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                        {session.duration_seconds > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(session.duration_seconds)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2 text-xs">
                      Completed
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(sessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60)}m
            </div>
            <div className="text-xs text-muted-foreground">Total Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {sessions.filter(s => s.status === 'active' || s.status === 'waiting').length}
            </div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewModule;