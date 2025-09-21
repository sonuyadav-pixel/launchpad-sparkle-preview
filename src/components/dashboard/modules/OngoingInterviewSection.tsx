import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Users, Clock, ArrowRight, Phone, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sessionManager } from '@/utils/SessionManager';
import { useInterviewSession } from '@/hooks/useInterviewSession';

export const OngoingInterviewSection = () => {
  const navigate = useNavigate();
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const { updateSession } = useInterviewSession();

  useEffect(() => {
    const updateSessionDetails = () => {
      const details = sessionManager.getSessionDetails();
      setSessionDetails(details);
      
      if (details && !details.isActive) {
        setTimeLeft(300 - details.timeSincePaused);
      }
    };

    updateSessionDetails();
    const interval = setInterval(updateSessionDetails, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-close session after 5 minutes
  useEffect(() => {
    if (sessionDetails?.shouldAutoClose) {
      handleAutoClose();
    }
  }, [sessionDetails?.shouldAutoClose]);

  const handleAutoClose = async () => {
    console.log('Auto-closing session due to inactivity');
    
    // Update session status to 'cancelled' in database
    if (sessionDetails?.sessionId) {
      try {
        await updateSession(sessionDetails.sessionId, { 
          status: 'cancelled',
          metadata: { reason: 'candidate_left', auto_closed: true }
        });
      } catch (error) {
        console.error('Failed to update session status:', error);
      }
    }
    
    // End session in manager
    sessionManager.endSession();
    setSessionDetails(null);
  };

  const handleReturnToInterview = () => {
    if (sessionDetails?.sessionId) {
      navigate(`/interview?session=${sessionDetails.sessionId}`);
    }
  };

  const handleEndSession = async () => {
    if (sessionDetails?.sessionId) {
      try {
        await updateSession(sessionDetails.sessionId, { 
          status: 'completed',
          ended_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to update session status:', error);
      }
    }
    
    sessionManager.endSession();
    setSessionDetails(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!sessionDetails) {
    return null;
  }

  const isWarning = timeLeft <= 60 && !sessionDetails.isActive; // Warning when less than 1 minute left

  return (
    <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-green-600" />
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  {sessionDetails.isActive ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg text-foreground">
                {sessionDetails.title}
              </h3>
            </div>

            {/* Session Details */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{sessionDetails.participants.length} participant{sessionDetails.participants.length !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Duration: {formatTime(sessionDetails.duration)}</span>
              </div>

              {!sessionDetails.isActive && (
                <div className={`flex items-center gap-1 ${isWarning ? 'text-red-600' : 'text-orange-600'}`}>
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    Auto-close in: {formatTimeLeft(timeLeft)}
                  </span>
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Participants:</p>
              <div className="flex gap-2">
                {sessionDetails.participants.map((participant: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {participant}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 ml-4">
            <Button
              onClick={handleReturnToInterview}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Return to Interview
            </Button>
            
            <Button
              onClick={handleEndSession}
              variant="destructive"
              size="sm"
            >
              <Phone className="h-4 w-4 mr-2" />
              End Session
            </Button>
          </div>
        </div>

        {/* Warning for auto-close */}
        {isWarning && !sessionDetails.isActive && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Session will automatically close in less than 1 minute due to inactivity.</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};