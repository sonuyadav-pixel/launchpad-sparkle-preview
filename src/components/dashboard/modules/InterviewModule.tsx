import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Users, Calendar, Clock, Play, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInterviewSession, type InterviewSession } from "@/hooks/useInterviewSession";
import { supabase } from "@/integrations/supabase/client";
import { OngoingInterviewSection } from "./OngoingInterviewSection";
import { UpcomingInterviewSection } from "./UpcomingInterviewSection";
import ProductValueProposition from "./ProductValueProposition";
import candidateInterview from "@/assets/candidate-interview.jpg";
const InterviewModule = () => {
  const navigate = useNavigate();
  const {
    sessions,
    loading,
    getSessions,
    createSession,
    updateSession
  } = useInterviewSession();
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    // Load user's sessions on component mount
    getSessions();
  }, [getSessions]);
  useEffect(() => {
    // Find any active session
    const active = sessions.find(session => session.status === 'active' || session.status === 'waiting');
    setActiveSession(active || null);
  }, [sessions]);
  const handleStartNewInterview = async () => {
    try {
      setError("");
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
      setError(`Failed to start interview: ${error.message}`);
    }
  };
  const handleJoinActiveSession = async () => {
    if (!activeSession) return;
    try {
      // Update session status to active if it's waiting
      if (activeSession.status === 'waiting') {
        await updateSession(activeSession.id, {
          status: 'active'
        });
      }

      // Navigate to interview page with session ID
      navigate(`/interview?session=${activeSession.id}`);
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'waiting':
        return 'bg-yellow-500';
      case 'paused':
        return 'bg-orange-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };
  return <div className="space-y-0">
      {/* Section 1: Upcoming Interview - Always check for scheduled interviews */}
      <UpcomingInterviewSection />
      
      {/* Section 2: Ongoing Interview - Always check for active session */}
      <OngoingInterviewSection />

      {/* Section 3: Main Interview Module */}
      <Card className="h-full">
        {error && <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>}
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="h-9 w-9 text-primary" />
              <h1 className="text-3xl font-bold">AI-Powered Interview</h1>
            </div>
            <div className="flex items-center gap-3">
              {activeSession && activeSession.status !== 'active' && <Badge className={`${getStatusColor(activeSession.status)} text-white`}>
                  {activeSession.status.toUpperCase()}
                </Badge>}
              <div className="relative">
                <img 
                  src={candidateInterview} 
                  alt="Candidate giving interview" 
                  className="w-32 h-24 rounded-lg object-cover shadow-lg relative z-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Session (non-active status) or Start New */}
          {activeSession && activeSession.status !== 'active' ? <div className="space-y-4">
              {/* Main Rejoin CTA */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className={`${getStatusColor(activeSession.status)} w-3 h-3 rounded-full mr-2 animate-pulse`}></div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                    Interview Ready
                  </h3>
                </div>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  {activeSession.title}
                </p>
                <div className="flex items-center justify-center gap-2 mb-4 text-sm text-green-600 dark:text-green-400">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(activeSession.created_at).toLocaleDateString()}</span>
                  {activeSession.duration_seconds > 0 && <>
                      <span>•</span>
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(activeSession.duration_seconds)}</span>
                    </>}
                </div>
                
                {/* Primary Action */}
                <Button size="lg" onClick={handleJoinActiveSession} className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white">
                  <Play className="h-4 w-4 mr-2" />
                  Continue Interview
                </Button>
                
                {/* Secondary Action */}
                <Button size="sm" variant="outline" onClick={handleStartNewInterview} className="w-full border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300">
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
            </div> : !activeSession ? (/* No Active Session - Start New */
        <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 relative overflow-hidden group/3d">
                {/* 3D Floating Elements - Only visible on hover */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover/3d:opacity-100 transition-opacity duration-500">
                  {/* Floating geometric shapes */}
                  <div className="absolute top-4 right-8 w-16 h-16 bg-primary/20 rounded-full animate-pulse group-hover/3d:animate-bounce transform rotate-12 transition-all duration-700"></div>
                  <div className="absolute bottom-6 left-8 w-12 h-12 bg-accent/30 rounded-lg animate-pulse group-hover/3d:animate-spin transform -rotate-12 transition-all duration-1000"></div>
                  <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-secondary/25 rounded-full animate-pulse group-hover/3d:animate-ping transform rotate-45 transition-all duration-500"></div>
                  <div className="absolute top-6 left-6 w-6 h-6 bg-primary/15 transform rotate-45 animate-pulse group-hover/3d:animate-bounce transition-all duration-800"></div>
                  <div className="absolute bottom-8 right-12 w-10 h-10 bg-accent/20 rounded-full animate-pulse group-hover/3d:animate-pulse transform -rotate-45 transition-all duration-600"></div>
                  
                  {/* Floating particles */}
                  <div className="absolute top-8 left-1/2 w-3 h-3 bg-primary/30 rounded-full animate-pulse group-hover/3d:animate-bounce transition-all duration-400" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute bottom-12 left-1/3 w-2 h-2 bg-accent/40 rounded-full animate-pulse group-hover/3d:animate-ping transition-all duration-300" style={{ animationDelay: '0.8s' }}></div>
                  <div className="absolute top-1/3 right-6 w-4 h-4 bg-secondary/20 rounded-full animate-pulse group-hover/3d:animate-bounce transition-all duration-900" style={{ animationDelay: '0.3s' }}></div>
                </div>
                
                <Video className="h-12 w-12 mx-auto mb-4 text-primary relative z-10" />
                <h3 className="text-lg font-semibold mb-2 relative z-10">Ready to Practice?</h3>
                <p className="text-muted-foreground mb-4 relative z-10">
                  Start your AI interview session and get personalized feedback
                </p>
                <Button onClick={handleStartNewInterview} size="lg" className="px-8 relative overflow-hidden group/btn z-10" disabled={loading}>
                  <span className="absolute inset-0 bg-black transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-in-out"></span>
                  <Video className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">{loading ? 'Loading...' : 'Start New Interview'}</span>
                </Button>
              </div>
            </div>) : null}

          {/* Recent Sessions - Only show if there are completed sessions */}
          {sessions.filter(s => s.status === 'completed').length > 0 && <div>
              <h4 className="font-medium mb-3">Recent Sessions</h4>
              {loading ? <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
                </div> : <div className="space-y-2 max-h-48 overflow-y-auto">
                  {sessions.filter(s => s.status === 'completed').slice(0, 3).map(session => <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{session.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(session.created_at).toLocaleDateString()}
                          </span>
                          {session.duration_seconds > 0 && <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(session.duration_seconds)}
                            </span>}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2 text-xs">
                        Completed
                      </Badge>
                    </div>)}
                </div>}
            </div>}
        </CardContent>
      </Card>

      {/* Product Value Proposition */}
      <ProductValueProposition />
    </div>;
};
export default InterviewModule;