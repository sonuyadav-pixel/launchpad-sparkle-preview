import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface InterviewProgressProps {
  currentPhase: string;
  questionCount: number;
  duration: number; // in seconds
}

const InterviewProgress: React.FC<InterviewProgressProps> = ({
  currentPhase = 'introduction',
  questionCount = 0,
  duration = 0
}) => {
  const phases = [
    { id: 'introduction', name: 'Introduction', questions: '1-2' },
    { id: 'background', name: 'Background', questions: '3-5' },
    { id: 'technical', name: 'Technical', questions: '6-8' },
    { id: 'behavioral', name: 'Behavioral', questions: '9-11' },
    { id: 'closing', name: 'Closing', questions: '12+' }
  ];

  const getCurrentPhaseIndex = () => {
    return phases.findIndex(phase => phase.id === currentPhase);
  };

  const getProgressPercentage = () => {
    const maxQuestions = 12;
    return Math.min((questionCount / maxQuestions) * 100, 100);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPhaseIndex = getCurrentPhaseIndex();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Interview Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Duration and Question Count */}
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{formatDuration(duration)}</div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{questionCount}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="text-muted-foreground">{Math.round(getProgressPercentage())}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Phase Indicators */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Interview Phases</div>
          {phases.map((phase, index) => (
            <div key={phase.id} className="flex items-center gap-3">
              {index < currentPhaseIndex ? (
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : index === currentPhaseIndex ? (
                <Circle className="h-4 w-4 text-primary fill-current flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    index === currentPhaseIndex 
                      ? 'text-primary' 
                      : index < currentPhaseIndex 
                        ? 'text-green-600' 
                        : 'text-muted-foreground'
                  }`}>
                    {phase.name}
                  </span>
                  {index === currentPhaseIndex && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Questions {phase.questions}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Phase Description */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-1">Current Phase: {phases[currentPhaseIndex]?.name}</div>
          <div className="text-xs text-muted-foreground">
            {currentPhase === 'introduction' && "Getting to know you and your background"}
            {currentPhase === 'background' && "Exploring your professional experience"}
            {currentPhase === 'technical' && "Discussing technical skills and problem-solving"}
            {currentPhase === 'behavioral' && "Understanding your soft skills and work style"}
            {currentPhase === 'closing' && "Wrapping up and addressing final questions"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewProgress;