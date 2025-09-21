import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { RealtimeInterviewClient } from '@/utils/RealtimeAudio';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Volume2,
  VolumeX,
  Settings,
  ArrowLeft,
  Send,
  Star,
  MessageSquare
} from 'lucide-react';
import TranscriptPanel from '@/components/interview/TranscriptPanel';
import { AIInterviewer } from '@/components/interview/AIInterviewer';
import InterviewProgress from '@/components/interview/InterviewProgress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'ai';
  message: string;
  timestamp: Date;
  confidence?: number;
}

const Interview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateSession } = useInterviewSession();

  // Session state
  const sessionId = searchParams.get('session');
  const [session, setSession] = useState(null);
  
  // UI state
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    experience: '',
    improvements: [],
    comments: ''
  });
  const [interviewStartTime, setInterviewStartTime] = useState<number>(0);
  const [interviewDuration, setInterviewDuration] = useState<number>(0);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const realtimeClientRef = useRef<RealtimeInterviewClient | null>(null);
  const userIdRef = useRef<string>('');
  const durationIntervalRef = useRef<number>();

  // Initialize session and user
  useEffect(() => {
    const initializeSession = async () => {
      if (!sessionId) {
        navigate('/dashboard');
        return;
      }

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        
        userIdRef.current = user.id;

        // Fetch session details
        const { data: sessionData, error } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .single();

        if (error || !sessionData) {
          toast({
            title: "Session Not Found",
            description: "The interview session could not be found.",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }

        setSession(sessionData);
        console.log('✅ Session initialized:', sessionData);

      } catch (error) {
        console.error('❌ Session initialization error:', error);
        navigate('/dashboard');
      }
    };

    initializeSession();
  }, [sessionId, navigate, toast]);

  // Handle voice to text updates
  const handleVoiceToTextUpdate = useCallback((text: string, isFinal: boolean, confidence?: number) => {
    if (isFinal && text.trim()) {
      // Add final transcript to the transcript history
      const userMessage: TranscriptMessage = {
        id: Date.now().toString(),
        speaker: 'user',
        message: text.trim(),
        timestamp: new Date(),
        confidence: confidence
      };
      setTranscript(prev => [userMessage, ...prev]);
      setCurrentTranscript('');
      
      // Send to realtime client if connected
      if (realtimeClientRef.current) {
        realtimeClientRef.current.sendTextMessage(text.trim());
      }
    } else if (!isFinal) {
      // Update current transcript with partial result
      setCurrentTranscript(text);
    }
  }, []);

  // Handle realtime messages
  const handleRealtimeMessage = useCallback((message: any) => {
    console.log('📨 Realtime message:', message.type);

    switch (message.type) {
      case 'connected':
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Real-time interview connection established",
        });
        break;

      case 'disconnected':
        setIsConnected(false);
        setIsListening(false);
        toast({
          title: "Disconnected",
          description: "Connection to interview server lost",
          variant: "destructive"
        });
        break;

      case 'transcript-partial':
        setCurrentTranscript(message.text);
        break;

      case 'transcript-final':
        if (message.text.trim()) {
          const userMessage: TranscriptMessage = {
            id: Date.now().toString(),
            speaker: 'user',
            message: message.text.trim(),
            timestamp: new Date(),
            confidence: message.confidence
          };
          setTranscript(prev => [userMessage, ...prev]);
          setCurrentTranscript('');
        }
        break;

      case 'bot-response':
        if (message.text.trim()) {
          const aiMessage: TranscriptMessage = {
            id: (Date.now() + 1).toString(),
            speaker: 'ai',
            message: message.text.trim(),
            timestamp: new Date()
          };
          setTranscript(prev => [aiMessage, ...prev]);
          setIsAISpeaking(true);
        }
        break;

      case 'bot-audio-complete':
        setIsAISpeaking(false);
        break;

      case 'error':
        toast({
          title: "Interview Error",
          description: message.error || "An error occurred during the interview",
          variant: "destructive"
        });
        break;

      default:
        console.log('🤷 Unhandled message type:', message.type);
    }
  }, [toast]);

  // Start interview
  const startInterview = async () => {
    try {
      console.log('🚀 Starting interview...');

      if (!sessionId || !userIdRef.current) {
        throw new Error('Missing session or user information');
      }

      // Initialize realtime client
      realtimeClientRef.current = new RealtimeInterviewClient(
        sessionId,
        userIdRef.current,
        handleRealtimeMessage
      );

      // Connect to WebSocket and wait for connection
      await realtimeClientRef.current.connect();
      console.log('✅ WebSocket connection established, proceeding with interview setup');

      // Start video if enabled
      if (isVideoEnabled) {
        await startVideo();
      }

      // Start audio recording - now that connection is confirmed
      await realtimeClientRef.current.startAudioRecording();
      setIsListening(true);

      setIsInterviewActive(true);
      const startTime = Date.now();
      setInterviewStartTime(startTime);
      
      // Start duration timer
      durationIntervalRef.current = window.setInterval(() => {
        setInterviewDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Update session status
      await updateSession(sessionId, { 
        status: 'active',
        started_at: new Date().toISOString()
      });

      console.log('✅ Interview started successfully');

    } catch (error) {
      console.error('❌ Failed to start interview:', error);
      toast({
        title: "Failed to Start Interview",
        description: error.message || "Could not start the interview session",
        variant: "destructive"
      });
    }
  };

  // End interview
  const endInterview = async () => {
    try {
      console.log('🏁 Ending interview...');

      // Stop realtime client
      if (realtimeClientRef.current) {
        realtimeClientRef.current.disconnect();
        realtimeClientRef.current = null;
      }

      // Stop video
      stopVideo();

      setIsInterviewActive(false);
      setIsListening(false);
      setIsConnected(false);
      setIsAISpeaking(false);
      
      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      // Update session status
      if (sessionId) {
        await updateSession(sessionId, { 
          status: 'completed',
          ended_at: new Date().toISOString()
        });
      }

      // Show feedback modal
      setShowFeedbackModal(true);

      console.log('✅ Interview ended successfully');

    } catch (error) {
      console.error('❌ Failed to end interview:', error);
      toast({
        title: "Error Ending Interview",
        description: "There was an issue ending the interview",
        variant: "destructive"
      });
    }
  };

  // Video management
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false // Audio handled separately
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsVideoEnabled(true);
      console.log('✅ Video started');
    } catch (error) {
      console.error('❌ Failed to start video:', error);
      toast({
        title: "Camera Access Failed",
        description: "Could not access camera",
        variant: "destructive"
      });
    }
  };

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsVideoEnabled(false);
    console.log('🛑 Video stopped');
  };

  const toggleVideo = async () => {
    if (isVideoEnabled) {
      stopVideo();
    } else {
      await startVideo();
    }
  };

  // Mute/unmute audio recording
  const toggleMute = () => {
    if (isMuted) {
      // Unmute - restart audio recording
      if (realtimeClientRef.current && isInterviewActive) {
        realtimeClientRef.current.startAudioRecording();
        setIsListening(true);
      }
    } else {
      // Mute - stop audio recording
      if (realtimeClientRef.current) {
        realtimeClientRef.current.stopAudioRecording();
        setIsListening(false);
      }
    }
    setIsMuted(!isMuted);
  };

  // Send text message manually
  const sendTextMessage = (text: string) => {
    if (realtimeClientRef.current && text.trim()) {
      realtimeClientRef.current.sendTextMessage(text.trim());
    }
  };

  // Submit feedback
  const submitFeedback = async () => {
    try {
      // Here you could save feedback to database
      console.log('📝 Feedback submitted:', feedbackData);
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      
      setShowFeedbackModal(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Failed to submit feedback:', error);
      toast({
        title: "Failed to Submit Feedback",
        description: "There was an error submitting your feedback",
        variant: "destructive"
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realtimeClientRef.current) {
        realtimeClientRef.current.disconnect();
      }
      stopVideo();
    };
    
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading interview session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold">AI Interview Session</h1>
                <p className="text-sm text-muted-foreground">
                  {session?.title || 'Interview Session'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              {isListening && (
                <Badge variant="outline" className="text-xs animate-pulse">
                  <Mic className="h-3 w-3 mr-1" />
                  Listening
                </Badge>
              )}
              {isAISpeaking && (
                <Badge variant="outline" className="text-xs animate-pulse">
                  <Volume2 className="h-3 w-3 mr-1" />
                  AI Speaking
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {isVideoEnabled ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <VideoOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Camera is off</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Live transcript overlay */}
                  {currentTranscript && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-3 rounded-lg">
                      <p className="text-sm">
                        <span className="text-blue-400 font-medium">You: </span>
                        {currentTranscript}
                        <span className="animate-pulse">|</span>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-4">
                  {!isInterviewActive ? (
                    <Button
                      onClick={startInterview}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                      disabled={!sessionId}
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Start Interview
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={toggleVideo}
                        className={isVideoEnabled ? '' : 'bg-red-50 border-red-200'}
                      >
                        {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={toggleMute}
                        className={isMuted ? 'bg-red-50 border-red-200' : ''}
                      >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                      
                      <Button
                        onClick={endInterview}
                        size="lg"
                        variant="destructive"
                        className="px-8"
                      >
                        <PhoneOff className="h-5 w-5 mr-2" />
                        End Interview
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Interviewer */}
          <div className="space-y-6">
            {/* AI Interviewer Component with Text-to-Speech */}
            <AIInterviewer 
              sessionId={sessionId}
              onTranscriptUpdate={(messages) => {
                // Convert AI Interviewer messages to transcript format
                const convertedTranscript = messages.map(msg => ({
                  id: msg.id,
                  speaker: msg.speaker,
                  message: msg.message,
                  timestamp: msg.timestamp,
                  metadata: {}
                }));
                setTranscript(convertedTranscript);
              }}
              onInterviewComplete={endInterview}
            />

            {/* Interview Progress */}
            <InterviewProgress
              currentPhase="conversation"
              questionCount={transcript.filter(m => m.speaker === 'ai').length}
              duration={interviewDuration}
            />
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Interview Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="rating">Overall Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= feedbackData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="experience">How was your experience?</Label>
              <Select
                value={feedbackData.experience}
                onValueChange={(value) => setFeedbackData(prev => ({ ...prev, experience: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select your experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="comments">Additional Comments</Label>
              <Textarea
                id="comments"
                placeholder="Share your thoughts about the interview..."
                value={feedbackData.comments}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, comments: e.target.value }))}
                className="mt-2"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1"
              >
                Skip Feedback
              </Button>
              <Button onClick={submitFeedback} className="flex-1">
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Interview;