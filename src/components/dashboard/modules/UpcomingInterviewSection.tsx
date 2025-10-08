import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar, Play, AlertCircle } from 'lucide-react';
import { format, isAfter, differenceInMinutes } from 'date-fns';
import { useScheduledInterviews } from '@/hooks/useScheduledInterviews';
import { useNavigate } from 'react-router-dom';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from 'sonner';
import { SectionLoader } from '@/components/ui/loader';

export const UpcomingInterviewSection = () => {
  const navigate = useNavigate();
  const { scheduledInterviews, updateScheduledInterview, loading } = useScheduledInterviews();
  const { createSession } = useInterviewSession();
  const { user } = useUserProfile();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTimeError, setShowTimeError] = useState(false);

  // Filter to only show interviews where current user is invited (not the creator)
  const getUpcomingInvitedInterview = () => {
    if (!user?.email) return null;
    
    const now = new Date();
    const invitedInterviews = scheduledInterviews.filter(interview => 
      interview.invited_email === user.email && 
      interview.status === 'scheduled' &&
      new Date(interview.scheduled_at) > now
    );
    
    return invitedInterviews.sort((a, b) => 
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    )[0] || null;
  };

  const upcomingInterview = getUpcomingInvitedInterview();

  // Update current time every minute and check for missed interviews
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Check if interview should be marked as missed
      if (upcomingInterview) {
        const interviewState = getInterviewStatus(upcomingInterview.scheduled_at, upcomingInterview.duration_minutes);
        if (interviewState.status === 'missed' && upcomingInterview.status === 'scheduled') {
          updateScheduledInterview(upcomingInterview.id, {
            status: 'missed'
          }).catch(err => console.error('Failed to update missed interview:', err));
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [upcomingInterview, updateScheduledInterview]);

  const getInterviewStatus = (scheduledAt: string, durationMinutes: number) => {
    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
    const now = new Date();
    
    // Available 1 hour before start time
    const availableTime = new Date(startTime.getTime() - 60 * 60 * 1000);
    
    // 2 hours after end time = missed
    const missedTime = new Date(endTime.getTime() + 2 * 60 * 60 * 1000);
    
    if (now < availableTime) {
      return { status: 'upcoming', canStart: false, label: 'Upcoming' };
    }
    
    if (now >= availableTime && now < startTime) {
      return { status: 'ready', canStart: true, label: 'Ready' };
    }
    
    if (now >= startTime && now < endTime) {
      return { status: 'ongoing', canStart: true, label: 'Ongoing' };
    }
    
    if (now >= endTime && now < missedTime) {
      return { status: 'delayed', canStart: true, label: 'Delayed' };
    }
    
    return { status: 'missed', canStart: false, label: 'Missed' };
  };

  const getTimeUntilAvailable = (scheduledAt: string) => {
    const startTime = new Date(scheduledAt);
    const availableTime = new Date(startTime.getTime() - 60 * 60 * 1000);
    const minutesUntil = differenceInMinutes(availableTime, currentTime);
    
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

    const interviewState = getInterviewStatus(upcomingInterview.scheduled_at, upcomingInterview.duration_minutes);
    
    if (!interviewState.canStart) {
      const timeUntil = getTimeUntilAvailable(upcomingInterview.scheduled_at);
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

      // Navigate to interview with scheduled interview ID
      navigate(`/interview?session=${session.id}&scheduled=${upcomingInterview.id}`);
    } catch (error: any) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview');
    }
  };

  if (loading) {
    return <SectionLoader text="Loading upcoming interviews..." variant="pulse" />;
  }

  if (!upcomingInterview) {
    return null;
  }

  const interviewState = getInterviewStatus(upcomingInterview.scheduled_at, upcomingInterview.duration_minutes);
  const timeUntilAvailable = getTimeUntilAvailable(upcomingInterview.scheduled_at);
  const interviewTime = format(new Date(upcomingInterview.scheduled_at), 'PPp');

  return (
    <Card className="mb-6 border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{upcomingInterview.interview_title}</h3>
              <Badge variant={
                interviewState.status === 'ready' ? 'default' :
                interviewState.status === 'ongoing' ? 'default' :
                interviewState.status === 'delayed' ? 'destructive' :
                'secondary'
              }>
                {interviewState.label}
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
              {upcomingInterview.invited_email && (
                <Badge variant="outline" className="text-xs">
                  Invited
                </Badge>
              )}
            </div>

            {showTimeError && !interviewState.canStart && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-2 rounded mb-3">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Interview will be available {timeUntilAvailable ? `in ${timeUntilAvailable}` : 'at scheduled time'}
                </span>
              </div>
            )}

            {interviewState.status === 'delayed' && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-2 rounded mb-3">
                <AlertCircle className="h-4 w-4" />
                <span>Interview time has passed. You can still join within 2 hours of end time.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!interviewState.canStart && timeUntilAvailable && (
              <div className="text-sm text-muted-foreground text-right">
                <div>Available in</div>
                <div className="font-semibold">{timeUntilAvailable}</div>
              </div>
            )}
            
            <Button 
              onClick={handleStartInterview}
              disabled={!interviewState.canStart}
              size="lg"
              className="min-w-[140px]"
            >
              <Play className="h-4 w-4 mr-2" />
              {interviewState.status === 'delayed' ? 'Join Now' : 'Start Interview'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};