import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Users, Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { type InterviewSession } from "@/hooks/useInterviewSession";

interface OngoingInterviewSectionProps {
  activeSession: InterviewSession;
  onJoinSession: () => void;
}

const OngoingInterviewSection = ({ activeSession, onJoinSession }: OngoingInterviewSectionProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Mock participants data - in real app this would come from real-time presence
  const participants = [
    { id: 1, name: "AI Interviewer", role: "Interviewer", isOnline: true },
    { id: 2, name: "You", role: "Candidate", isOnline: true },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Calculate elapsed time since session started
      const sessionStart = new Date(activeSession.created_at);
      const elapsed = Math.floor((Date.now() - sessionStart.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession.created_at]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'paused': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="mb-6 border-green-200 dark:border-green-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`${getStatusColor(activeSession.status)} w-3 h-3 rounded-full animate-pulse`}></div>
            <CardTitle className="text-green-900 dark:text-green-100">
              Interview in Progress
            </CardTitle>
          </div>
          <Badge className={`${getStatusColor(activeSession.status)} text-white`}>
            LIVE
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time and Duration Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <Clock className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <div className="text-lg font-mono font-semibold text-green-900 dark:text-green-100">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Current Time</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Video className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-mono font-semibold text-blue-900 dark:text-blue-100">
              {formatDuration(elapsedTime)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Duration</div>
          </div>
        </div>

        {/* Participants Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Participants ({participants.length})
            </span>
          </div>
          
          <div className="space-y-2">
            {participants.map((participant) => (
              <div 
                key={participant.id}
                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${participant.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium">{participant.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {participant.role}
                  </Badge>
                </div>
                {participant.isOnline && (
                  <span className="text-xs text-green-600 dark:text-green-400">Online</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Join Button */}
        <Button 
          onClick={onJoinSession}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <Play className="h-4 w-4 mr-2" />
          Rejoin Interview
        </Button>
      </CardContent>
    </Card>
  );
};

export default OngoingInterviewSection;