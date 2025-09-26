import { useState } from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Laptop, Users, Plus, Calendar as CalendarIcon, Clock, User, Trash2 } from 'lucide-react';
import { useScheduledInterviews, type ScheduledInterview } from '@/hooks/useScheduledInterviews';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { SectionLoader } from '@/components/ui/loader';

const CalendarModule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('calendar');
  const { scheduledInterviews, deleteScheduledInterview, loading } = useScheduledInterviews();

  const handleDeleteInterview = async (interview: ScheduledInterview, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteScheduledInterview(interview.id);
      toast.success('Interview deleted successfully');
    } catch (error) {
      toast.error('Failed to delete interview');
    }
  };

  const renderScheduledInterviewsList = () => {
    if (scheduledInterviews.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-6">
            <Laptop className="h-24 w-24 text-muted-foreground/40" />
            <div className="absolute -top-2 -right-2 bg-primary rounded-full p-2">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-muted-foreground mb-2">
            No Interview Scheduled
          </h3>
          <p className="text-muted-foreground/70 mb-6 max-w-md">
            You haven't scheduled any interviews yet. Create your first interview to get started.
          </p>
        </div>
      );
    }

    // Sort interviews by date
    const sortedInterviews = [...scheduledInterviews].sort(
      (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );

    return (
      <div className="space-y-4">
        {sortedInterviews.map((interview) => (
          <Card key={interview.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={interview.status === 'scheduled' ? 'default' : 'secondary'}>
                      {interview.status}
                    </Badge>
                    <h4 className="font-semibold text-lg">{interview.interview_title}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
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
                  
                  {interview.invited_email && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <strong>Invited:</strong> {interview.invited_email}
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteInterview(interview, e)}
                  className="ml-4 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Interview Calendar</TabsTrigger>
          <TabsTrigger value="scheduled" className="font-semibold text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Scheduled Interviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="flex-1 mt-4">
          <CalendarView 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate} 
          />
        </TabsContent>
        
        <TabsContent value="scheduled" className="flex-1 mt-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Scheduled Interviews
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <SectionLoader text="Loading scheduled interviews..." variant="dots" />
              ) : (
                renderScheduledInterviewsList()
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarModule;