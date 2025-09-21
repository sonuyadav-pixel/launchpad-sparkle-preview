import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Volume2,
  Settings,
  ArrowLeft
} from 'lucide-react';

interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

const Interview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { speak, isPlaying, loading: ttsLoading } = useElevenLabsTTS();

  // Session state
  const sessionId = searchParams.get('session');
  const [session, setSession] = useState(null);
  
  // UI state
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [localTranscript, setLocalTranscript] = useState<TranscriptMessage[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTime = useRef<number>(Date.now());
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Speech Recognition Functions
  const initializeSpeechRecognition = useCallback(() => {
    console.log('🔧 Initializing Speech Recognition');
    
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive"
      });
      return false;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure recognition
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;
    
    console.log('✅ Speech recognition configured');
    
    // Event handlers
    recognitionRef.current.onstart = () => {
      console.log('🎤 Speech recognition STARTED');
      setIsListening(true);
      lastSpeechTime.current = Date.now();
    };

    recognitionRef.current.onend = () => {
      console.log('🎤 Speech recognition ENDED');
      setIsListening(false);
      
      // Auto-restart if interview is active and not manually stopped
      if (isInterviewActive && !isMuted) {
        console.log('🔄 Auto-restarting speech recognition...');
        setTimeout(() => {
          if (isInterviewActive && !isMuted && !isListening) {
            startSpeechRecognition();
          }
        }, 1000); // Increased delay to prevent rapid restarts
      }
    };

    recognitionRef.current.onresult = (event: any) => {
      console.log('🎤 Speech result received');
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update interim transcript for live display
      setCurrentTranscript(interimTranscript);
      
      // Process final transcript
      if (finalTranscript.trim()) {
        console.log('📝 Final transcript:', finalTranscript);
        lastSpeechTime.current = Date.now();
        processUserSpeech(finalTranscript.trim());
        setCurrentTranscript('');
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('🎤 Speech recognition error:', event.error);
      
      // Handle different error types
      if (event.error === 'no-speech') {
        console.log('🔇 No speech detected - continuing...');
        return; // Don't show error for no-speech
      }
      
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to continue",
          variant: "destructive"
        });
      }
    };

    return true;
  }, [isInterviewActive, isMuted]);

  const startSpeechRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      if (!initializeSpeechRecognition()) return;
    }

    try {
      if (!isListening && isInterviewActive && !isMuted) {
        console.log('🚀 Starting speech recognition...');
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('❌ Failed to start speech recognition:', error);
      // If failed, try to reinitialize and restart
      setTimeout(() => {
        if (isInterviewActive && !isMuted) {
          console.log('🔄 Reinitializing speech recognition after error...');
          recognitionRef.current = null;
          initializeSpeechRecognition();
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        }
      }, 2000);
    }
  }, [isListening, initializeSpeechRecognition, isInterviewActive, isMuted]);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current && isListening) {
      console.log('🛑 Stopping speech recognition...');
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Process user speech and generate AI response
  const processUserSpeech = async (transcript: string) => {
    try {
      console.log('🧠 Processing user speech:', transcript);
      
      // Add user message to transcript
      const userMessage: TranscriptMessage = {
        id: Date.now().toString(),
        speaker: 'user',
        message: transcript,
        timestamp: new Date()
      };
      
      setLocalTranscript(prev => [userMessage, ...prev]);
      
      // Add to database
      await addTranscriptMessage(userMessage);
      
      // Generate AI response
      const aiResponse = await generateAIResponse(transcript);
      
      if (aiResponse) {
        const aiMessage: TranscriptMessage = {
          id: (Date.now() + 1).toString(),
          speaker: 'ai',
          message: aiResponse,
          timestamp: new Date()
        };
        
        setLocalTranscript(prev => [aiMessage, ...prev]);
        await addTranscriptMessage(aiMessage);
        
        // Speak the AI response
        console.log('🔊 Speaking AI response...');
        await speak(aiResponse, 'alloy');
      }
      
    } catch (error) {
      console.error('❌ Error processing speech:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process speech. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Generate AI response based on user input using OpenAI
  const generateAIResponse = async (userInput: string): Promise<string> => {
    try {
      console.log('🤖 Generating AI response using OpenAI for:', userInput);
      
      // Get conversation context (last 5 messages for efficiency)
      const context = localTranscript.slice(0, 5).reverse();
      
      // Call our OpenAI edge function
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { 
          message: userInput,
          context: context
        }
      });

      if (error) {
        console.error('🤖 OpenAI API error:', error);
        throw error;
      }

      if (!data.response) {
        throw new Error('No response received from OpenAI');
      }

      console.log('🤖 Generated AI response:', data.response);
      return data.response;
      
    } catch (error) {
      console.error('❌ Error generating AI response:', error);
      return "I'm sorry, could you please repeat that?";
    }
  };

  // Add transcript message to database
  const addTranscriptMessage = async (message: TranscriptMessage) => {
    try {
      await supabase.functions.invoke('interview-session', {
        body: {
          action: 'add-transcript',
          session_id: sessionId,
          speaker: message.speaker,
          message: message.message,
          metadata: {}
        }
      });
    } catch (error) {
      console.error('❌ Error saving transcript:', error);
    }
  };

  // Video Functions
  const startVideo = async () => {
    try {
      console.log('📹 Starting video...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false // We handle audio separately
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsVideoEnabled(true);
      console.log('✅ Video started successfully');
      
    } catch (error) {
      console.error('❌ Error starting video:', error);
      toast({
        title: "Camera Access Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopVideo = () => {
    console.log('📹 Stopping video...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsVideoEnabled(false);
  };

  // Interview Control Functions
  const startInterview = async () => {
    try {
      console.log('🎯 Starting interview...');
      
      setIsInterviewActive(true);
      
      // Start video
      await startVideo();
      
      // Start speech recognition immediately and aggressively
      console.log('🎯 Force starting speech recognition...');
      if (!recognitionRef.current) {
        initializeSpeechRecognition();
      }
      
      // Try multiple times to ensure it starts
      const forceStart = async () => {
        for (let i = 0; i < 3; i++) {
          try {
            if (recognitionRef.current && !isListening) {
              console.log(`🚀 Attempt ${i + 1} to start speech recognition`);
              recognitionRef.current.start();
              await new Promise(resolve => setTimeout(resolve, 1000));
              if (isListening) {
                console.log('✅ Speech recognition started successfully');
                break;
              }
            }
          } catch (error) {
            console.log(`❌ Attempt ${i + 1} failed:`, error);
            if (i === 2) {
              // Last attempt - reinitialize
              recognitionRef.current = null;
              initializeSpeechRecognition();
            }
          }
        }
      };
      
      await forceStart();
      
      // Setup silence detection and heartbeat
      setupSilenceDetection();
      setupSpeechHeartbeat();
      
      // Welcome message
      const welcomeMessage = "Hello! Welcome to your AI interview. Please introduce yourself and tell me about your background.";
      
      const aiMessage: TranscriptMessage = {
        id: Date.now().toString(),
        speaker: 'ai', 
        message: welcomeMessage,
        timestamp: new Date()
      };
      
      setLocalTranscript([aiMessage]);
      await addTranscriptMessage(aiMessage);
      await speak(welcomeMessage, 'alloy');
      
      toast({
        title: "Interview Started",
        description: "You can now begin speaking",
      });
      
    } catch (error) {
      console.error('❌ Error starting interview:', error);
      toast({
        title: "Start Error", 
        description: "Failed to start interview. Please try again.",
        variant: "destructive"
      });
    }
  };

  const endInterview = () => {
    console.log('🏁 Ending interview...');
    
    setIsInterviewActive(false);
    stopSpeechRecognition();
    stopVideo();
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    if (heartbeatRef.current) {
      clearTimeout(heartbeatRef.current);
    }
    
    toast({
      title: "Interview Ended",
      description: "Thank you for your time!",
    });
  };

  // Silence Detection for Fallback Logic
  const setupSilenceDetection = () => {
    const checkForSilence = () => {
      if (!isInterviewActive) return;
      
      const timeSinceLastSpeech = Date.now() - lastSpeechTime.current;
      
      // If no speech for 30 seconds, prompt user
      if (timeSinceLastSpeech > 30000) {
        console.log('🔇 Silence detected - prompting user');
        
        const promptMessage = "I haven't heard from you in a while. Are you still there? Please continue when you're ready.";
        
        const aiMessage: TranscriptMessage = {
          id: Date.now().toString(),
          speaker: 'ai',
          message: promptMessage,
          timestamp: new Date()
        };
        
        setLocalTranscript(prev => [aiMessage, ...prev]);
        addTranscriptMessage(aiMessage);
        speak(promptMessage, 'alloy');
        
        lastSpeechTime.current = Date.now(); // Reset timer
      }
      
      // Check again in 10 seconds
      silenceTimeoutRef.current = setTimeout(checkForSilence, 10000);
    };
    
    silenceTimeoutRef.current = setTimeout(checkForSilence, 10000);
  };

  // Speech Recognition Heartbeat to ensure it stays active
  const setupSpeechHeartbeat = () => {
    const heartbeat = () => {
      if (!isInterviewActive) return;
      
      // Check if speech recognition is still active
      if (!isListening && !isMuted && isInterviewActive) {
        console.log('💓 Heartbeat: Speech recognition not active, restarting...');
        startSpeechRecognition();
      }
      
      // Schedule next heartbeat
      heartbeatRef.current = setTimeout(heartbeat, 5000);
    };
    
    heartbeatRef.current = setTimeout(heartbeat, 5000);
  };

  // Toggle Functions
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (!isMuted) {
      stopSpeechRecognition();
    } else if (isInterviewActive) {
      startSpeechRecognition();
    }
  };

  // Load session on mount
  useEffect(() => {
    if (sessionId) {
      console.log('📁 Loading session:', sessionId);
      // Load session data if needed
    }
  }, [sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up interview component');
      stopVideo();
      stopSpeechRecognition();
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (heartbeatRef.current) {
        clearTimeout(heartbeatRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">AI Interview Session</h1>
            {isInterviewActive && (
              <Badge variant="default" className="bg-green-500">
                LIVE
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video and Controls */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Feed */}
            <Card>
              <CardContent className="p-6">
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  {isVideoEnabled ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Camera Off</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Status Indicators */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {isListening && (
                      <Badge className="bg-red-500">
                        <Mic className="w-3 h-3 mr-1" />
                        Listening
                      </Badge>
                    )}
                    {isPlaying && (
                      <Badge className="bg-blue-500">
                        <Volume2 className="w-3 h-3 mr-1" />
                        AI Speaking
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4">
                  {!isInterviewActive ? (
                    <Button 
                      onClick={startInterview}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Start Interview
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant={isVideoEnabled ? "default" : "secondary"}
                        size="lg"
                        onClick={isVideoEnabled ? stopVideo : startVideo}
                      >
                        {isVideoEnabled ? (
                          <Video className="w-5 h-5" />
                        ) : (
                          <VideoOff className="w-5 h-5" />
                        )}
                      </Button>
                      
                      <Button
                        variant={isMuted ? "secondary" : "default"}
                        size="lg"
                        onClick={toggleMute}
                      >
                        {isMuted ? (
                          <MicOff className="w-5 h-5" />
                        ) : (
                          <Mic className="w-5 h-5" />
                        )}
                      </Button>
                      
                      <Button
                        onClick={endInterview}
                        size="lg"
                        variant="destructive"
                      >
                        <PhoneOff className="w-5 h-5 mr-2" />
                        End Interview
                      </Button>
                      
                      {/* Manual Speech Control for debugging */}
                      <Button
                        onClick={() => {
                          console.log('🔧 Manual speech recognition start - Current state:', {
                            isListening,
                            isInterviewActive,
                            isMuted,
                            hasRecognition: !!recognitionRef.current
                          });
                          if (!isListening && !isMuted) {
                            startSpeechRecognition();
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        {isListening ? '🎤 Listening' : '🔇 Start Mic'}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transcript */}
          <div className="space-y-4">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Live Transcript</span>
                  {currentTranscript && (
                    <Badge variant="outline" className="text-xs">
                      Speaking...
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-full px-6 pb-6">
                  <div className="space-y-4">
                    {/* Current interim transcript */}
                    {currentTranscript && (
                      <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">You (typing...)</Badge>
                        </div>
                        <p className="text-sm text-gray-600 italic">{currentTranscript}</p>
                      </div>
                    )}
                    
                    {/* Transcript messages */}
                    {localTranscript.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.speaker === 'user'
                            ? 'bg-blue-50 border-l-4 border-blue-400'
                            : 'bg-green-50 border-l-4 border-green-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={message.speaker === 'user' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {message.speaker === 'user' ? 'You' : 'AI Interviewer'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{message.message}</p>
                      </div>
                    ))}
                    
                    {localTranscript.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <p>No conversation yet.</p>
                        <p className="text-sm">Start the interview to begin.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;