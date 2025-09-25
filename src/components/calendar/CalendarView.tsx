import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Plus } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { useScheduledInterviews, type ScheduledInterview } from '@/hooks/useScheduledInterviews';
import { AddInterviewModal } from './AddInterviewModal';

type CalendarViewType = 'monthly' | 'weekly' | 'daily';

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const CalendarView = ({ selectedDate, onDateSelect }: CalendarViewProps) => {
  const [viewType, setViewType] = useState<CalendarViewType>('monthly');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { scheduledInterviews, getInterviewsForDate } = useScheduledInterviews();

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewType === 'monthly') {
      onDateSelect(direction === 'next' ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1));
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

  const renderMonthlyView = () => (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={(date) => date && onDateSelect(date)}
      className="w-full"
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
  );

  const renderWeeklyView = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = endOfWeek(selectedDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-sm">
            {day}
          </div>
        ))}
        {weekDays.map(day => {
          const dayInterviews = getInterviewsForDate(day);
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] p-2 border rounded cursor-pointer hover:bg-muted/50 ${
                isSameDay(day, selectedDate) ? 'bg-primary/10 border-primary' : ''
              }`}
              onClick={() => onDateSelect(day)}
            >
              <div className="font-medium text-sm mb-1">
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayInterviews.slice(0, 3).map(interview => (
                  <div
                    key={interview.id}
                    className={`text-xs p-1 rounded ${getStatusColor(interview.status)} text-white truncate`}
                  >
                    {format(new Date(interview.scheduled_at), 'HH:mm')} {interview.candidate_name}
                  </div>
                ))}
                {dayInterviews.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayInterviews.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
            <div key={hour} className="flex border-b border-border/50">
              <div className="w-16 py-2 text-sm text-muted-foreground">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1 min-h-[50px] p-2">
                {hourInterviews.map(interview => (
                  <div
                    key={interview.id}
                    className={`p-2 rounded mb-1 ${getStatusColor(interview.status)} text-white`}
                  >
                    <div className="font-medium">{interview.interview_title}</div>
                    <div className="text-sm flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {interview.candidate_name}
                      <Clock className="h-3 w-3 ml-2" />
                      {format(new Date(interview.scheduled_at), 'HH:mm')}
                    </div>
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
            <Button onClick={() => setIsAddModalOpen(true)} size="sm">
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
            {viewType === 'monthly' && format(selectedDate, 'MMMM yyyy')}
            {viewType === 'weekly' && `Week of ${format(startOfWeek(selectedDate), 'MMM d, yyyy')}`}
            {viewType === 'daily' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {viewType === 'monthly' && renderMonthlyView()}
        {viewType === 'weekly' && renderWeeklyView()}
        {viewType === 'daily' && renderDailyView()}
      </CardContent>

      <AddInterviewModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        selectedDate={selectedDate}
      />
    </Card>
  );
};