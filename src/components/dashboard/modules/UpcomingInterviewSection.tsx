import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar, Lock, Play, AlertCircle } from 'lucide-react';
import { format, isAfter, differenceInMinutes } from 'date-fns';
import { useScheduledInterviews } from '@/hooks/useScheduledInterviews';
import { useNavigate } from 'react-router-dom';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { toast } from 'sonner';

export const UpcomingInterviewSection = () => {
  const navigate = useNavigate();
  const { getUpcomingInterview, updateScheduledInterview } = useScheduledInterviews();
  const { createSession } = useInterviewSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTimeError, setShowTimeError] = useState(false);

  const upcomingInterview = getUpcomingInterview();

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const isInterviewUnlocked = (scheduledAt: string) => {
    const interviewTime = new Date(scheduledAt);
    const now = new Date();
    
    // Unlock 5 minutes before scheduled time
    const unlockTime = new Date(interviewTime.getTime() - 5 * 60 * 1000);
    return isAfter(now, unlockTime);
  };

  const getTimeUntilUnlock = (scheduledAt: string) => {
    const interviewTime = new Date(scheduledAt);
    const unlockTime = new Date(interviewTime.getTime() - 5 * 60 * 1000);
    const minutesUntil = differenceInMinutes(unlockTime, currentTime);
    
    if (minutesUntil <= 0) return null;
    
    const hours = Math.floor(minutesUntil / 60);
    const minutes = minutesUntil % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleStartInterview = async () => {
    if (!upcomingInterview) return;

    if (!isInterviewUnlocked(upcomingInterview.scheduled_at)) {
      const timeUntil = getTimeUntilUnlock(upcomingInterview.scheduled_at);
      const interviewTime = format(new Date(upcomingInterview.scheduled_at), 'PPp');
      
      setShowTimeError(true);
      toast.error(`Interview will be available ${timeUntil ? `in ${timeUntil}` : 'at'} ${interviewTime}`);
      
      setTimeout(() => setShowTimeError(false), 3000);
      return;
    }

    try {
      // Create interview session
      const session = await createSession({
        title: upcomingInterview.interview_title,
        interview_type: 'scheduled'
      });

      // Update scheduled interview with session ID and mark as active
      await updateScheduledInterview(upcomingInterview.id, {
        session_id: session.id,
        status: 'active'
      });

      // Navigate to interview
      navigate(`/interview?session=${session.id}`);
    } catch (error: any) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview');
    }
  };

  if (!upcomingInterview) {
    return null;
  }

  const isUnlocked = isInterviewUnlocked(upcomingInterview.scheduled_at);
  const timeUntilUnlock = getTimeUntilUnlock(upcomingInterview.scheduled_at);
  const interviewTime = format(new Date(upcomingInterview.scheduled_at), 'PPp');

  return (
    <Card className="mb-6 border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{upcomingInterview.interview_title}</h3>
              <Badge variant={isUnlocked ? "default" : "secondary"}>
                {isUnlocked ? "Ready" : "Scheduled"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {upcomingInterview.candidate_name}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(upcomingInterview.scheduled_at), 'MMM dd')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {interviewTime}
              </div>
            </div>

            {showTimeError && !isUnlocked && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-2 rounded mb-3">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Interview will be available {timeUntilUnlock ? `in ${timeUntilUnlock}` : 'at scheduled time'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isUnlocked && timeUntilUnlock && (
              <div className="text-sm text-muted-foreground text-right">
                <div>Unlocks in</div>
                <div className="font-semibold">{timeUntilUnlock}</div>
              </div>
            )}
            
            <Button 
              onClick={handleStartInterview}
              disabled={!isUnlocked}
              size="lg"
              className={`min-w-[140px] ${!isUnlocked ? 'opacity-60' : ''}`}
            >
              {isUnlocked ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Interview
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Locked
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};