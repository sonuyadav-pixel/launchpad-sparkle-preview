import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PermissionRequest from '@/components/interview/PermissionRequest';
import VideoInterface from '@/components/interview/VideoInterface';
import TranscriptDisplay from '@/components/interview/TranscriptDisplay';
import QuestionDisplay from '@/components/interview/QuestionDisplay';
import InterviewControls from '@/components/interview/InterviewControls';
import VoiceActivityIndicator from '@/components/interview/VoiceActivityIndicator';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { useInterviewFlow } from '@/hooks/useInterviewFlow';
import { Card } from '@/components/ui/card';

const Interview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasPermissions, setHasPermissions] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const { createSession, currentSession } = useInterviewSession();
  const { 
    startInterview, 
    endInterview, 
    interviewState,
    isAISpeaking,
    isUserSpeaking,
    currentQuestion,
    transcript
  } = useInterviewFlow();

  const handlePermissionGranted = () => {
    setHasPermissions(true);
    toast({
      title: "Permissions Granted",
      description: "Camera and microphone access granted successfully.",
    });
  };

  const handlePermissionDenied = (error: string) => {
    toast({
      title: "Permission Denied",
      description: error,
      variant: "destructive",
    });
  };

  const handleStartInterview = async () => {
    try {
      // Create new interview session
      const session = await createSession({
        title: `Interview Session - ${new Date().toLocaleDateString()}`,
        interview_type: 'general',
        metadata: { ai_interview: true }
      });

      if (session) {
        await startInterview(session.id);
        setInterviewStarted(true);
        toast({
          title: "Interview Started",
          description: "Your AI interview has begun. Good luck!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start interview. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEndInterview = async () => {
    try {
      await endInterview();
      setInterviewStarted(false);
      toast({
        title: "Interview Completed",
        description: "Your interview has been saved successfully.",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end interview properly.",
        variant: "destructive",
      });
    }
  };

  if (!hasPermissions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <PermissionRequest
            onPermissionGranted={handlePermissionGranted}
            onPermissionDenied={handlePermissionDenied}
          />
        </Card>
      </div>
    );
  }

  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Ready to Begin?</h1>
            <p className="text-muted-foreground">
              Your AI interviewer is ready. The session will be recorded and analyzed to provide you with feedback.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={handleStartInterview}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              Start AI Interview
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-foreground">AI Interview</h1>
          <VoiceActivityIndicator 
            isUserSpeaking={isUserSpeaking}
            isAISpeaking={isAISpeaking}
          />
        </div>

        {/* Main Interview Interface */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Video & Controls */}
          <div className="space-y-4">
            <VideoInterface />
            <InterviewControls
              onEndInterview={handleEndInterview}
              interviewState={interviewState}
            />
          </div>

          {/* Right Column - Questions & Transcript */}
          <div className="space-y-4">
            <QuestionDisplay 
              question={currentQuestion}
              isAISpeaking={isAISpeaking}
            />
            <TranscriptDisplay 
              transcript={transcript}
              isUserSpeaking={isUserSpeaking}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;