import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Plus, Trash2, X, Laptop, Users, Play, AlertCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, addYears, subYears, differenceInMinutes } from 'date-fns';
import { useScheduledInterviews, type ScheduledInterview } from '@/hooks/useScheduledInterviews';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AddInterviewModal } from './AddInterviewModal';
import { SectionLoader } from '@/components/ui/loader';

type CalendarViewType = 'monthly' | 'weekly' | 'daily';

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const CalendarView = ({ selectedDate, onDateSelect }: CalendarViewProps) => {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<CalendarViewType>('monthly');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSelectedDate, setModalSelectedDate] = useState<Date | undefined>(undefined);
  const [modalSelectedTime, setModalSelectedTime] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { scheduledInterviews, getInterviewsForDate, deleteScheduledInterview, updateScheduledInterview, loading } = useScheduledInterviews();
  const { profile } = useUserProfile();
  const { createSession } = useInterviewSession();

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

  const handleStartInterview = async (interview: ScheduledInterview) => {
    const interviewState = getInterviewStatus(interview.scheduled_at, interview.duration_minutes);
    
    if (!interviewState.canStart) {
      const timeUntil = getTimeUntilAvailable(interview.scheduled_at);
      const interviewTime = format(new Date(interview.scheduled_at), 'PPp');
      
      toast.error(`Interview will be available ${timeUntil ? `in ${timeUntil}` : 'at'} ${interviewTime}`);
      return;
    }

    try {
      // Create interview session
      const session = await createSession({
        title: interview.interview_title,
        interview_type: 'scheduled'
      });

      // Update scheduled interview with session ID and mark as active
      await updateScheduledInterview(interview.id, {
        session_id: session.id,
        status: 'active'
      });

      // Navigate to interview with scheduled interview ID
      navigate(`/interview?session=${session.id}&scheduled=${interview.id}`);
    } catch (error: any) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview');
    }
  };

  const handleDeleteInterview = async (interview: ScheduledInterview, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteScheduledInterview(interview.id);
      toast.success('Interview deleted successfully');
    } catch (error) {
      toast.error('Failed to delete interview');
    }
  };

  const handleDateTimeClick = (date: Date, time?: string) => {
    setModalSelectedDate(date);
    setModalSelectedTime(time);
    setIsAddModalOpen(true);
  };

  const handleAddInterviewClick = () => {
    setModalSelectedDate(selectedDate);
    setModalSelectedTime(undefined);
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setModalSelectedDate(undefined);
    setModalSelectedTime(undefined);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewType === 'monthly') {
      onDateSelect(direction === 'next' ? addYears(selectedDate, 1) : subYears(selectedDate, 1));
    } else if (viewType === 'weekly') {
      onDateSelect(direction === 'next' ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1));
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      onDateSelect(newDate);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'missed':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderMonthlyView = () => {
    const yearStart = new Date(selectedDate.getFullYear(), 0, 1);
    const yearEnd = new Date(selectedDate.getFullYear(), 11, 31);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-full overflow-hidden">
        {months.map(month => (
          <div key={month.toISOString()} className="border rounded-lg p-2 min-w-0 overflow-hidden">
            <div className="text-center font-semibold mb-2 text-sm">
              {format(month, 'MMM')}
            </div>
            <div className="w-full min-w-0">
              <Calendar
                mode="single"
                selected={isSameDay(month, selectedDate) ? selectedDate : undefined}
                onSelect={(date) => {
                  if (date) {
                    onDateSelect(date);
                    handleDateTimeClick(date);
                  }
                }}
                className="w-full text-xs p-1 min-w-0"
                month={month}
                fixedWeeks={false}
                showOutsideDays={false}
                modifiers={{
                  hasInterview: (date) => getInterviewsForDate(date).length > 0
                }}
                modifiersStyles={{
                  hasInterview: { 
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    fontWeight: 'bold'
                  }
                }}
                classNames={{
                  months: "flex flex-col space-y-2",
                  month: "space-y-2 w-full min-w-0",
                  caption: "flex justify-center relative items-center pb-1",
                  caption_label: "text-xs font-medium",
                  nav: "hidden",
                  table: "w-full border-collapse min-w-0",
                  head_row: "flex w-full",
                  head_cell: "text-muted-foreground w-full font-normal text-[0.5rem] flex-1 min-w-0 text-center p-0",
                  row: "flex w-full",
                  cell: "text-center p-0 relative flex-1 min-w-0 aspect-square text-[0.5rem]",
                  day: "w-full h-full p-0 font-normal text-[0.5rem] flex items-center justify-center min-w-0 hover:bg-accent"
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = endOfWeek(selectedDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="overflow-auto max-h-[600px]">
        <div className="grid grid-cols-8 gap-1 sticky top-0 bg-background z-10 border-b">
          <div className="p-2 text-center font-semibold text-sm">Time</div>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={day} className="p-2 text-center font-semibold text-sm">
              <div>{day}</div>
              <div className="text-xs text-muted-foreground">
                {format(weekDays[index], 'd')}
              </div>
            </div>
          ))}
        </div>
        
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8 gap-1 border-b min-h-[60px]">
            <div className="p-2 text-xs text-muted-foreground text-center border-r">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map(day => {
              const hourInterviews = getInterviewsForDate(day).filter(interview => {
                const interviewHour = new Date(interview.scheduled_at).getHours();
                return interviewHour === hour;
              });
              
              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className={`p-1 cursor-pointer hover:bg-muted/50 border border-transparent hover:border-primary/20 ${
                    isSameDay(day, selectedDate) ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    onDateSelect(day);
                    handleDateTimeClick(day, `${hour.toString().padStart(2, '0')}:00`);
                  }}
                >
                  {hourInterviews.map(interview => (
                    <div
                      key={interview.id}
                      className={`text-xs p-1 rounded mb-1 ${getStatusColor(interview.status)} text-white relative group`}
                    >
                      <div className="truncate">{interview.candidate_name}</div>
                      <div className="text-xs opacity-75">
                        {format(new Date(interview.scheduled_at), 'HH:mm')}
                      </div>
                      <button
                        onClick={(e) => handleDeleteInterview(interview, e)}
                        className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderDailyView = () => {
    const dayInterviews = getInterviewsForDate(selectedDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-2">
        {hours.map(hour => {
          const hourInterviews = dayInterviews.filter(interview => {
            const interviewHour = new Date(interview.scheduled_at).getHours();
            return interviewHour === hour;
          });

          return (
            <div 
              key={hour} 
              className="flex border-b border-border/50 cursor-pointer hover:bg-muted/20"
              onClick={() => handleDateTimeClick(selectedDate, `${hour.toString().padStart(2, '0')}:00`)}
            >
              <div className="w-16 py-2 text-sm text-muted-foreground">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1 min-h-[50px] p-2">
                {hourInterviews.map(interview => (
                  <div
                    key={interview.id}
                    className={`p-2 rounded mb-1 ${getStatusColor(interview.status)} text-white relative group`}
                  >
                    <div className="font-medium">{interview.interview_title}</div>
                    <div className="text-sm flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {interview.candidate_name}
                      <Clock className="h-3 w-3 ml-2" />
                      {format(new Date(interview.scheduled_at), 'HH:mm')}
                      {interview.invited_email && (
                        <span className="text-xs opacity-75 ml-2">
                          (Invited: {interview.invited_email})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDeleteInterview(interview, e)}
                      className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Filter interviews to only show those where current user is invited (not creator)
  const invitedInterviews = scheduledInterviews.filter(interview => 
    interview.invited_email && interview.invited_email === profile?.email
  );

  const hasInvitedInterviews = invitedInterviews.length > 0;

  // Update current time every minute and check for missed interviews
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Check if any invited interviews should be marked as missed
      invitedInterviews.forEach(interview => {
        if (interview.status === 'scheduled') {
          const interviewState = getInterviewStatus(interview.scheduled_at, interview.duration_minutes);
          if (interviewState.status === 'missed') {
            updateScheduledInterview(interview.id, {
              status: 'missed'
            }).catch(err => console.error('Failed to update missed interview:', err));
          }
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [invitedInterviews, updateScheduledInterview]);

  const renderScheduledInterviewsList = () => {
    if (invitedInterviews.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-6">
            <Laptop className="h-24 w-24 text-muted-foreground/40" />
            <div className="absolute -top-2 -right-2 bg-primary rounded-full p-2">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-muted-foreground mb-2">
            No Invited Interviews
          </h3>
          <p className="text-muted-foreground/70 mb-6 max-w-md">
            You haven't been invited to any interviews yet.
          </p>
        </div>
      );
    }

    // Sort invited interviews by date
    const sortedInterviews = [...invitedInterviews].sort(
      (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );

    return (
      <div className="space-y-4">
        {sortedInterviews.map((interview) => {
          const interviewState = getInterviewStatus(interview.scheduled_at, interview.duration_minutes);
          const timeUntilAvailable = getTimeUntilAvailable(interview.scheduled_at);
          
          return (
            <Card key={interview.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{interview.interview_title}</h4>
                      <Badge variant={
                        interviewState.status === 'ready' ? 'default' :
                        interviewState.status === 'ongoing' ? 'default' :
                        interviewState.status === 'delayed' ? 'destructive' :
                        interviewState.status === 'missed' ? 'secondary' :
                        'secondary'
                      }>
                        {interviewState.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{interview.candidate_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{interview.duration_minutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{format(new Date(interview.scheduled_at), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(interview.scheduled_at), 'h:mm a')}</span>
                      </div>
                    </div>

                    {interviewState.status === 'delayed' && (
                      <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-2 rounded mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Interview time has passed. You can still join within 2 hours of end time.</span>
                      </div>
                    )}

                    {!interviewState.canStart && timeUntilAvailable && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                        <Clock className="h-4 w-4" />
                        <span>Available in {timeUntilAvailable}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => handleStartInterview(interview)}
                      disabled={!interviewState.canStart || interview.status === 'completed' || interview.status === 'missed'}
                      size="lg"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {interviewState.status === 'delayed' ? 'Join Now' : 'Start Interview'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Interview Management
          </CardTitle>
          <Button onClick={handleAddInterviewClick} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Interview
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={hasInvitedInterviews ? "grid w-full grid-cols-1" : "hidden"}>
            {hasInvitedInterviews && <TabsTrigger value="scheduled">My Invited Interviews</TabsTrigger>}
          </TabsList>
          
          {!hasInvitedInterviews ? (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex border rounded-md">
                  {(['monthly', 'weekly', 'daily'] as const).map(type => (
                    <Button
                      key={type}
                      variant={viewType === type ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewType(type)}
                      className="rounded-none first:rounded-l-md last:rounded-r-md"
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-lg font-semibold min-w-[200px] text-center">
                    {viewType === 'monthly' && format(selectedDate, 'yyyy')}
                    {viewType === 'weekly' && `Week of ${format(startOfWeek(selectedDate), 'MMM d, yyyy')}`}
                    {viewType === 'daily' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {loading ? (
                <SectionLoader text="Loading calendar..." variant="dots" />
              ) : (
                <>
                  {viewType === 'monthly' && renderMonthlyView()}
                  {viewType === 'weekly' && renderWeeklyView()}
                  {viewType === 'daily' && renderDailyView()}
                </>
              )}
            </div>
          ) : (
            <TabsContent value="scheduled" className="mt-6">
              {loading ? (
                <SectionLoader text="Loading invited interviews..." variant="dots" />
              ) : (
                renderScheduledInterviewsList()
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>

      <AddInterviewModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        selectedDate={modalSelectedDate}
        selectedTime={modalSelectedTime}
      />
    </Card>
  );
};