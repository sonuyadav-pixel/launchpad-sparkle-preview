import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useScheduledInterviews } from '@/hooks/useScheduledInterviews';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
}

export const AddInterviewModal = ({ isOpen, onClose, selectedDate }: AddInterviewModalProps) => {
  const [candidateName, setCandidateName] = useState('');
  const [interviewTitle, setInterviewTitle] = useState('');
  const [date, setDate] = useState<Date>(selectedDate || new Date());
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);

  const { createScheduledInterview } = useScheduledInterviews();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidateName.trim() || !interviewTitle.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Combine date and time
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledAt = new Date(date);
      scheduledAt.setHours(hours, minutes, 0, 0);

      await createScheduledInterview({
        candidate_name: candidateName.trim(),
        interview_title: interviewTitle.trim(),
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: duration,
        status: 'scheduled'
      });

      toast.success('Interview scheduled successfully!');
      onClose();
      
      // Reset form
      setCandidateName('');
      setInterviewTitle('');
      setTime('09:00');
      setDuration(60);
    } catch (error: any) {
      console.error('Error scheduling interview:', error);
      toast.error(error.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidateName">Candidate Name *</Label>
            <Input
              id="candidateName"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Enter candidate's name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewTitle">Interview Title *</Label>
            <Input
              id="interviewTitle"
              value={interviewTitle}
              onChange={(e) => setInterviewTitle(e.target.value)}
              placeholder="e.g., Frontend Developer Interview"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <select
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="15"
                max="240"
                step="15"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};