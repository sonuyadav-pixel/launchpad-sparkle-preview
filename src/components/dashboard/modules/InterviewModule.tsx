import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Users, Calendar, Clock, Play, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInterviewSession, type InterviewSession } from "@/hooks/useInterviewSession";
import { useToast } from "@/components/ui/use-toast";

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
      const session = await createSession({
        title: `Interview Session - ${new Date().toLocaleDateString()}`,
        interview_type: 'general'
      });
      
      // Navigate to interview page with session ID
      navigate(`/interview?session=${session.id}`);
    } catch (error) {
      console.error('Failed to start interview:', error);
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
        {/* Active Session Alert */}
        {activeSession && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  {activeSession.status === 'active' ? 'Interview in Progress' : 'Interview Ready'}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {activeSession.title}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-blue-600 dark:text-blue-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(activeSession.created_at).toLocaleDateString()}
                  </span>
                  {activeSession.duration_seconds > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(activeSession.duration_seconds)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                onClick={handleJoinActiveSession}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play className="h-3 w-3 mr-1" />
                {activeSession.status === 'active' ? 'Rejoin Interview' : 'Start Interview'}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleStartNewInterview}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Start New
              </Button>
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div>
          <h4 className="font-medium mb-3">Recent Sessions</h4>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sessions.slice(0, 5).map((session) => (
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
                  <Badge variant="outline" className="ml-2">
                    {session.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No interview sessions yet</p>
            </div>
          )}
        </div>

        {/* Start New Interview Button (when no active session) */}
        {!activeSession && (
          <Button 
            onClick={handleStartNewInterview} 
            className="w-full"
            disabled={loading}
          >
            <Video className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Start New Interview'}
          </Button>
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