import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Plus, Trash2, X } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, addYears, subYears } from 'date-fns';
import { useScheduledInterviews, type ScheduledInterview } from '@/hooks/useScheduledInterviews';
import { toast } from 'sonner';
import { AddInterviewModal } from './AddInterviewModal';
import { SectionLoader } from '@/components/ui/loader';

type CalendarViewType = 'monthly' | 'weekly' | 'daily';

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const CalendarView = ({ selectedDate, onDateSelect }: CalendarViewProps) => {
  const [viewType, setViewType] = useState<CalendarViewType>('monthly');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSelectedDate, setModalSelectedDate] = useState<Date | undefined>(undefined);
  const [modalSelectedTime, setModalSelectedTime] = useState<string | undefined>(undefined);
  const { scheduledInterviews, getInterviewsForDate, deleteScheduledInterview, loading } = useScheduledInterviews();

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
      <div className="grid grid-cols-4 gap-4">
        {months.map(month => (
          <div key={month.toISOString()} className="border rounded-lg p-3">
            <div className="text-center font-semibold mb-2 text-sm">
              {format(month, 'MMM')}
            </div>
            <Calendar
              mode="single"
              selected={isSameDay(month, selectedDate) ? selectedDate : undefined}
              onSelect={(date) => {
                if (date) {
                  onDateSelect(date);
                  handleDateTimeClick(date);
                }
              }}
              className="w-full text-xs"
              month={month}
              fixedWeeks={false}
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
            />
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

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Interview Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
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
            <Button onClick={handleAddInterviewClick} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Interview
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {viewType === 'monthly' && format(selectedDate, 'yyyy')}
            {viewType === 'weekly' && `Week of ${format(startOfWeek(selectedDate), 'MMM d, yyyy')}`}
            {viewType === 'daily' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <SectionLoader text="Loading calendar..." variant="dots" />
        ) : (
          <>
            {viewType === 'monthly' && renderMonthlyView()}
            {viewType === 'weekly' && renderWeeklyView()}
            {viewType === 'daily' && renderDailyView()}
          </>
        )}
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