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
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { sessionManager } from '@/utils/SessionManager';
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
  const { updateSession } = useInterviewSession();

  // Session state
  const sessionId = searchParams.get('session');
  const [session, setSession] = useState(null);
  
  // UI state
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [localTranscript, setLocalTranscript] = useState<TranscriptMessage[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  
  // Conversation flow control
  const lastProcessedTime = useRef<number>(0);
  const isAISpeaking = useRef(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTime = useRef<number>(Date.now());
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const autoResponseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscript = useRef<string>('');
  const lastPartialTranscript = useRef<string>('');

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
      
      // Auto-restart if interview is active
      if (isInterviewActive) {
        console.log('🔄 Auto-restarting speech recognition...');
        setTimeout(() => {
          if (isInterviewActive && !isListening) {
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
      
      // Handle continuous speech accumulation
      if (finalTranscript.trim()) {
        console.log('📝 Final transcript chunk:', finalTranscript);
        lastSpeechTime.current = Date.now();
        resetAutoCloseTimer();
        
        // Accumulate transcript chunks
        accumulatedTranscript.current += (accumulatedTranscript.current ? ' ' : '') + finalTranscript.trim();
        console.log('📝 Accumulated transcript:', accumulatedTranscript.current);
        
        // Reset the 5-second auto-response timer
        resetAutoResponseTimer();
        setCurrentTranscript('');
      }
      
      // Handle interim results for real-time feedback
      if (interimTranscript.trim() && interimTranscript !== lastPartialTranscript.current) {
        lastPartialTranscript.current = interimTranscript;
        lastSpeechTime.current = Date.now();
        
        // Reset auto-response timer on any speech activity
        resetAutoResponseTimer();
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
  }, [isInterviewActive]);

  const startSpeechRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      if (!initializeSpeechRecognition()) return;
    }

    try {
      if (!isListening && isInterviewActive) {
        console.log('🚀 Starting speech recognition...');
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('❌ Failed to start speech recognition:', error);
      // If failed, try to reinitialize and restart
      setTimeout(() => {
        if (isInterviewActive) {
          console.log('🔄 Reinitializing speech recognition after error...');
          recognitionRef.current = null;
          initializeSpeechRecognition();
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        }
      }, 2000);
    }
  }, [isListening, initializeSpeechRecognition, isInterviewActive]);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current && isListening) {
      console.log('🛑 Stopping speech recognition...');
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Auto-response timer management
  const resetAutoResponseTimer = useCallback(() => {
    console.log('⏰ Resetting auto-response timer');
    
    // Clear existing timer
    if (autoResponseTimeoutRef.current) {
      clearTimeout(autoResponseTimeoutRef.current);
      autoResponseTimeoutRef.current = null;
    }
    
    // Set new 5-second timer
    autoResponseTimeoutRef.current = setTimeout(() => {
      console.log('⏰ 5-second silence detected, triggering auto-response');
      triggerAutoResponse();
    }, 5000);
  }, []);

  // Trigger auto-response after silence
  const triggerAutoResponse = async () => {
    if (!isInterviewActive || isAISpeaking.current) {
      console.log('🚫 Auto-response cancelled: interview inactive or AI speaking');
      return;
    }

    const transcript = accumulatedTranscript.current.trim();
    
    if (!transcript || transcript.length < 3) {
      console.log('🚫 Auto-response cancelled: no meaningful speech accumulated');
      return;
    }

    console.log('🤖 Processing accumulated speech for auto-response:', transcript);
    
    // Clear accumulated transcript
    accumulatedTranscript.current = '';
    lastPartialTranscript.current = '';
    
    try {
      // Check if we just processed speech recently (debounce)
      const now = Date.now();
      if (lastProcessedTime.current && now - lastProcessedTime.current < 3000) {
        console.log('🚫 Skipping auto-response: too soon after last response');
        return;
      }
      
      lastProcessedTime.current = now;
      
      // Add user message to transcript
      const userMessage: TranscriptMessage = {
        id: Date.now().toString(),
        speaker: 'user',
        message: transcript,
        timestamp: new Date()
      };
      
      setLocalTranscript(prev => [userMessage, ...prev]);
      await addTranscriptMessage(userMessage);
      
      // Generate AI response immediately
      console.log('🤖 Generating auto AI response...');
      const aiResponse = await generateAIResponse(transcript);
      
      if (aiResponse && !isAISpeaking.current) {
        const aiMessage: TranscriptMessage = {
          id: (Date.now() + 1).toString(),
          speaker: 'ai',
          message: aiResponse,
          timestamp: new Date()
        };
        
        setLocalTranscript(prev => [aiMessage, ...prev]);
        await addTranscriptMessage(aiMessage);
        
        // Speak the AI response
        console.log('🔊 Speaking auto AI response...');
        isAISpeaking.current = true;
        await speak(aiResponse, 'alloy');
        isAISpeaking.current = false;
      }
    } catch (error) {
      console.error('❌ Error in auto-response:', error);
      isAISpeaking.current = false;
    }
  };

  // Process user speech manually (for manual triggers if needed)
  const processUserSpeech = async (transcript: string) => {
    try {
      console.log('🧠 Processing user speech manually:', transcript);
      
      // Skip if transcript is too short or AI is currently speaking
      if (transcript.length < 3) {
        console.log('🚫 Skipping: transcript too short');
        return;
      }
      
      // Check if AI is currently speaking or processing
      if (isAISpeaking.current) {
        console.log('🚫 Skipping: AI is currently speaking');
        return;
      }
      
      // Check if we just processed speech recently (debounce)
      const now = Date.now();
      if (lastProcessedTime.current && now - lastProcessedTime.current < 3000) {
        console.log('🚫 Skipping: too soon after last response');
        return;
      }
      
      lastProcessedTime.current = now;
      
      // Add user message to transcript
      const userMessage: TranscriptMessage = {
        id: Date.now().toString(),
        speaker: 'user',
        message: transcript,
        timestamp: new Date()
      };
      
      setLocalTranscript(prev => [userMessage, ...prev]);
      await addTranscriptMessage(userMessage);
      
      // Generate AI response
      const aiResponse = await generateAIResponse(transcript);
      
      if (aiResponse && !isAISpeaking.current) {
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
        isAISpeaking.current = true;
        await speak(aiResponse, 'alloy');
        isAISpeaking.current = false;
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

  // Generate AI response based on user input using ElevenLabs
  const generateAIResponse = async (userInput: string): Promise<string> => {
    try {
      console.log('🤖 Generating AI response using ElevenLabs for:', userInput);
      
      // Get conversation context (last 5 messages for efficiency)
      const context = localTranscript.slice(0, 5).reverse();
      
      // Call our ElevenLabs edge function with rate limiting
      const { data, error } = await supabase.functions.invoke('elevenlabs-chat', {
        body: { 
          message: userInput,
          context: context,
          userId: sessionId // Use session ID as user identifier for rate limiting
        }
      });

      if (error) {
        console.error('🤖 ElevenLabs API error:', error);
        throw error;
      }

      if (!data.response) {
        throw new Error('No response received from ElevenLabs');
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
      console.log('📹 Current video state:', { 
        isVideoEnabled, 
        hasVideoRef: !!videoRef.current,
        currentStream: !!streamRef.current 
      });
      
      // Stop any existing stream first
      if (streamRef.current) {
        console.log('🛑 Stopping existing stream...');
        streamRef.current.getTracks().forEach(track => {
          console.log('🛑 Stopping track:', track.kind, track.readyState);
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }
      
      console.log('🎥 Requesting camera access...');
      
      // Request permissions explicitly first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false // We handle audio separately
      });
      
      console.log('✅ Camera stream obtained:', {
        streamId: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        console.log('📺 Setting video source...');
        videoRef.current.srcObject = stream;
        
        // Add event listeners for video element
        videoRef.current.onloadedmetadata = () => {
          console.log('📺 Video metadata loaded');
        };
        
        videoRef.current.oncanplay = () => {
          console.log('📺 Video can play');
        };
        
        videoRef.current.onplay = () => {
          console.log('📺 Video started playing');
        };
        
        videoRef.current.onerror = (error) => {
          console.error('📺 Video element error:', error);
        };
        
        // Ensure video plays
        try {
          await videoRef.current.play();
          console.log('✅ Video play() called successfully');
        } catch (playError) {
          console.error('❌ Video play error:', playError);
          // Try to play again after a delay
          setTimeout(async () => {
            try {
              if (videoRef.current) {
                await videoRef.current.play();
                console.log('✅ Video play() retry successful');
              }
            } catch (retryError) {
              console.error('❌ Video play retry failed:', retryError);
            }
          }, 1000);
        }
      } else {
        console.error('❌ Video ref is null - waiting for element to render...');
        // Wait for video element to be available
        setTimeout(() => {
          if (videoRef.current && streamRef.current) {
            console.log('📺 Retrying video setup after delay...');
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(error => {
              console.error('❌ Delayed video play error:', error);
            });
          } else {
            console.error('❌ Video ref or stream still null after delay');
          }
        }, 500);
      }
      
      setIsVideoEnabled(true);
      console.log('✅ Video started successfully');
      
    } catch (error) {
      console.error('❌ Error starting video:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        constraint: error.constraint
      });
      
      // More specific error handling
      let errorMessage = "Could not access camera. Please check permissions.";
      if (error.name === 'NotAllowedError') {
        errorMessage = "Camera access denied. Please allow camera permissions and try again.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No camera found. Please ensure your camera is connected.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "Camera is being used by another application.";
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = "Camera doesn't support the requested settings.";
      }
      
      toast({
        title: "Camera Access Error",
        description: errorMessage,
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

  // Check for active sessions before starting
  const checkForActiveSession = () => {
    const hasActive = sessionManager.hasActiveSession();
    const activeId = sessionManager.getActiveSessionId();
    
    if (hasActive && activeId !== sessionId) {
      toast({
        title: "Active Interview Detected",
        description: "Please end your current interview before starting a new one.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  // Auto-close functionality
  const resetAutoCloseTimer = () => {
    lastActivityRef.current = Date.now();
    
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    
    autoCloseTimerRef.current = setTimeout(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      if (timeSinceActivity >= 300000 && isInterviewActive) { // 5 minutes
        console.log('🔒 Auto-closing interview due to inactivity');
        toast({
          title: "Interview Auto-Closed",
          description: "Session ended due to 5 minutes of inactivity",
          variant: "default"
        });
        endInterview();
      }
    }, 300000); // 5 minutes
  };

  // Interview Control Functions
  const startInterview = async () => {
    try {
      console.log('🎯 Starting interview...');
      
      // Check for active sessions first
      if (!checkForActiveSession()) {
        return;
      }
      
      setIsInterviewActive(true);
      resetAutoCloseTimer();
      
      // Update session status in database
      if (sessionId) {
        try {
          await updateSession(sessionId, { 
            status: 'active', 
            started_at: new Date().toISOString() 
          });
        } catch (error) {
          console.error('Failed to update session status:', error);
        }
      }
      
      // Start video
      await startVideo();
      
      // Set active session in session manager
      if (sessionId) {
        sessionManager.setActiveSession(
          sessionId, 
          streamRef.current, 
          recognitionRef.current,
          "AI Interview Session"
        );
      }
      
      // Start speech recognition immediately and aggressively
      console.log('🎯 Force starting speech recognition...');
      if (!recognitionRef.current) {
        initializeSpeechRecognition();
      }
      
      // Ensure speech recognition is properly reset before starting
      const forceStart = async () => {
        // First, stop any existing recognition
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (e) {
            console.log('🔧 Clearing existing recognition');
          }
        }
        
        // Reinitialize if needed
        if (!recognitionRef.current) {
          initializeSpeechRecognition();
        }
        
        // Try to start with proper error handling
        try {
          if (recognitionRef.current && !isListening) {
            console.log('🚀 Starting speech recognition');
            recognitionRef.current.start();
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('✅ Speech recognition started successfully');
          }
        } catch (error) {
          console.log('❌ Speech recognition start failed:', error);
          // Continue anyway - the interview can still work without perfect speech recognition
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

  const endInterview = async () => {
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
    
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    
    if (autoResponseTimeoutRef.current) {
      clearTimeout(autoResponseTimeoutRef.current);
    }
    
    // Clear accumulated speech
    accumulatedTranscript.current = '';
    lastPartialTranscript.current = '';
    
    // Update session status in database
    if (sessionId) {
      try {
        await updateSession(sessionId, { 
          status: 'completed', 
          ended_at: new Date().toISOString() 
        });
      } catch (error) {
        console.error('Failed to update session status:', error);
      }
    }
    
    // End session in manager
    sessionManager.endSession();
    
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
      if (!isListening && isInterviewActive) {
        console.log('💓 Heartbeat: Speech recognition not active, restarting...');
        startSpeechRecognition();
      }
      
      // Schedule next heartbeat
      heartbeatRef.current = setTimeout(heartbeat, 5000);
    };
    
    heartbeatRef.current = setTimeout(heartbeat, 5000);
  };


  // Load session on mount
  useEffect(() => {
    if (sessionId) {
      console.log('📁 Loading session:', sessionId);
      // Check if there's an active session in the manager
      const hasActive = sessionManager.hasActiveSession();
      const activeId = sessionManager.getActiveSessionId();
      
      if (hasActive && activeId === sessionId) {
        console.log('🔄 Restoring active session from manager');
        setIsInterviewActive(true);
        // You could restore more state here if needed
      }
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
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
      if (autoResponseTimeoutRef.current) {
        clearTimeout(autoResponseTimeoutRef.current);
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

        {/* Side by Side Layout: User (Left) and AI (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* User Video Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>You</span>
                {isListening && (
                  <Badge className="bg-red-500">
                    <Mic className="w-3 h-3 mr-1" />
                    Listening
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden" style={{ minHeight: '320px' }}>
                {isVideoEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    controls={false}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('📺 Video element error event:', e);
                    }}
                    onLoadStart={() => {
                      console.log('📺 Video load start');
                    }}
                    onCanPlay={() => {
                      console.log('📺 Video can play event');
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Camera Off</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>AI Interviewer</span>
                {isPlaying && (
                  <Badge className="bg-blue-500">
                    <Volume2 className="w-3 h-3 mr-1" />
                    Speaking
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '320px' }}>
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <p className="text-lg font-medium">AI Interviewer</p>
                  <p className="text-sm opacity-80">
                    {isPlaying ? 'Speaking...' : isInterviewActive ? 'Ready to listen' : 'Waiting to start'}
                  </p>
                </div>
                
                {/* AI Status Indicator */}
                <div className="absolute bottom-4 right-4">
                  <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Section */}
        <Card className="mb-6">
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
                    onClick={endInterview}
                    size="lg"
                    variant="destructive"
                  >
                    <PhoneOff className="w-5 h-5 mr-2" />
                    End Interview
                  </Button>
                  
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transcript Section - Full Width Below */}
        <Card>
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
            <ScrollArea className="h-[400px] px-6 pb-6">
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
  );
};

export default Interview;