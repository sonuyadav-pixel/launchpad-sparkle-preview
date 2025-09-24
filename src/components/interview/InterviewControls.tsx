import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Square, 
  Pause, 
  Play, 
  Volume2, 
  VolumeX,
  Clock,
  MessageSquare
} from 'lucide-react';

type InterviewState = 'idle' | 'introduction' | 'questioning' | 'waiting_response' | 'processing' | 'completed';

interface InterviewControlsProps {
  onEndInterview: () => void;
  interviewState: InterviewState;
  onPause?: () => void;
  onResume?: () => void;
  onToggleVolume?: () => void;
  questionCount?: number;
  duration?: number;
  isVolumeMuted?: boolean;
}

const InterviewControls: React.FC<InterviewControlsProps> = ({
  onEndInterview,
  interviewState,
  onPause,
  onResume,
  onToggleVolume,
  questionCount = 0,
  duration = 0,
  isVolumeMuted = false
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateLabel = (state: InterviewState): string => {
    switch (state) {
      case 'idle': return 'Ready';
      case 'introduction': return 'Starting';
      case 'questioning': return 'AI Speaking';
      case 'waiting_response': return 'Your Turn';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const getStateVariant = (state: InterviewState): "default" | "secondary" | "destructive" | "outline" => {
    switch (state) {
      case 'questioning': return 'secondary';
      case 'waiting_response': return 'default';
      case 'processing': return 'outline';
      case 'completed': return 'destructive';
      default: return 'secondary';
    }
  };

  const isPaused = interviewState === 'idle';
  const canPause = ['questioning', 'waiting_response'].includes(interviewState);
  const canResume = isPaused;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Interview Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={getStateVariant(interviewState)} className="flex items-center gap-1">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
              {getStateLabel(interviewState)}
            </Badge>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span>Q{questionCount}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Pause/Resume */}
          {canPause && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPause}
              className="flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}
          
          {canResume && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResume}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Resume
            </Button>
          )}

          {/* Volume Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleVolume}
            className="flex items-center gap-2"
          >
            {isVolumeMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* End Interview */}
          <Button
            variant="destructive"
            size="sm"
            onClick={onEndInterview}
            className="flex items-center gap-2"
            disabled={interviewState === 'completed'}
          >
            <Square className="w-4 h-4" />
            End Interview
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground">
          {interviewState === 'waiting_response' && (
            <p>💬 Speak clearly into your microphone. The AI will listen for your complete response.</p>
          )}
          {interviewState === 'questioning' && (
            <p>🔊 The AI is asking a question. You can interrupt at any time by speaking.</p>
          )}
          {interviewState === 'processing' && (
            <p>⚙️ Processing your response and preparing the next question...</p>
          )}
          {interviewState === 'completed' && (
            <p>✅ Interview completed successfully. Your responses have been saved.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewControls;