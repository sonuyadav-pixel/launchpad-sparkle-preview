import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
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
  VolumeX,
  Settings,
  ArrowLeft,
  Send,
  Star
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [localTranscript, setLocalTranscript] = useState<TranscriptMessage[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    experience: '',
    improvements: [],
    comments: ''
  });
  
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

  // Speech Recognition Functions
  const initializeSpeechRecognition = useCallback(async () => {
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

    // Request microphone permission first
    try {
      console.log('🎤 Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ Microphone permission granted');
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access for speech recognition",
        variant: "destructive"
      });
      return false;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure recognition for continuous listening
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;
    
    // Disable automatic stopping on silence
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current.webkitGrammarList = null;
    }
    
    console.log('✅ Speech recognition configured');
    
    // Event handlers
    recognitionRef.current.onstart = () => {
      console.log('🎤 Speech recognition STARTED');
      console.log('🎤 Recognition state:', {
        continuous: recognitionRef.current?.continuous,
        interimResults: recognitionRef.current?.interimResults,
        lang: recognitionRef.current?.lang
      });
      setIsListening(true);
      lastSpeechTime.current = Date.now();
    };

    recognitionRef.current.onend = () => {
      console.log('🎤 Speech recognition ENDED');
      setIsListening(false);
      
      // Only auto-restart if interview is active AND AI is not speaking
      if (isInterviewActive && !isAISpeaking.current) {
        console.log('🔄 Auto-restarting speech recognition...');
        setTimeout(async () => {
          if (isInterviewActive && !isListening && !isAISpeaking.current) {
            await startSpeechRecognition();
          }
        }, 1000); // Reduced delay since we have better control now
      }
    };

    recognitionRef.current.onresult = (event: any) => {
      console.log('🎤 Speech result received');
      console.log('🎤 Event details:', {
        resultsLength: event.results.length,
        resultIndex: event.resultIndex,
        results: Array.from(event.results).map((result: any, i: number) => ({
          index: i,
          transcript: result[0].transcript,
          confidence: result[0].confidence,
          isFinal: result.isFinal
        }))
      });
      
      // Skip if AI is currently speaking to prevent loops
      if (isAISpeaking.current) {
        console.log('🚫 Skipping speech result: AI is speaking');
        return;
      }
      
      let finalTranscript = '';
      let interimTranscript = '';
      
      // Only process NEW results (start from resultIndex to avoid reprocessing)
      const resultIndex = event.resultIndex || 0;
      for (let i = resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          console.log('✅ Final result:', transcript);
        } else {
          interimTranscript += transcript;
          console.log('⏳ Interim result:', transcript);
        }
      }
      
      // Always update current transcript to show live speech
      const displayTranscript = finalTranscript || interimTranscript;
      if (displayTranscript.trim()) {
        setCurrentTranscript(displayTranscript);
        lastSpeechTime.current = Date.now();
        resetAutoCloseTimer();
      }
      
      // Only process final transcript for AI response
      if (finalTranscript.trim()) {
        console.log('📝 Processing final transcript:', finalTranscript);
        
        // Stop speech recognition to prevent loops
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        
        processUserSpeech(finalTranscript.trim());
        setCurrentTranscript(''); // Clear after processing
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('🎤 Speech recognition error:', event.error);
      console.error('🎤 Error details:', {
        error: event.error,
        type: event.type,
        timeStamp: event.timeStamp,
        currentState: {
          isListening,
          isInterviewActive,
          isMuted,
          hasRecognition: !!recognitionRef.current
        }
      });
      
      // Handle different error types
      if (event.error === 'no-speech') {
        console.log('🔇 No speech detected - continuing...');
        return; // Don't show error for no-speech, let it auto-restart
      }
      
      if (event.error === 'aborted') {
        console.log('🔄 Speech recognition was aborted - will restart');
        setIsListening(false);
        return; // Let the onend handler restart it
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

  const startSpeechRecognition = useCallback(async () => {
    console.log('🚀 startSpeechRecognition called');
    console.log('🚀 Current state:', { 
      isListening, 
      isInterviewActive, 
      isAISpeaking: isAISpeaking.current,
      hasRecognition: !!recognitionRef.current 
    });

    if (!recognitionRef.current) {
      console.log('🚀 No recognition ref, initializing...');
      const initialized = await initializeSpeechRecognition();
      if (!initialized) return;
    }

    try {
      // Only start if not already listening and interview is active
      if (!isListening && isInterviewActive && !isAISpeaking.current && recognitionRef.current) {
        console.log('🚀 Starting speech recognition...');
        recognitionRef.current.start();
      } else {
        console.log('🚫 Cannot start speech recognition:', { 
          isListening, 
          isInterviewActive, 
          isAISpeaking: isAISpeaking.current,
          hasRecognition: !!recognitionRef.current 
        });
      }
    } catch (error) {
      console.error('❌ Failed to start speech recognition:', error);
      console.log('🔄 Resetting recognition due to error...');
      
      // Reset and try again after delay if interview is still active
      if (isInterviewActive) {
        recognitionRef.current = null;
        setIsListening(false);
        
        setTimeout(() => {
          console.log('🔄 Retrying speech recognition after error...');
          if (!isListening && isInterviewActive && !isAISpeaking.current) {
            initializeSpeechRecognition();
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log('🔄 Retry successful');
              } catch (retryError) {
                console.error('🔄 Retry failed:', retryError);
              }
            }
          }
        }, 2000);
      }
    }
  }, [isListening, initializeSpeechRecognition, isInterviewActive]);

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
      
      // Skip if transcript is too short or AI is currently speaking
      if (transcript.length < 3) {
        console.log('🚫 Skipping: transcript too short');
        // Restart speech recognition for next input
        setTimeout(async () => {
          if (isInterviewActive && !isListening && !isAISpeaking.current) {
            await startSpeechRecognition();
          }
        }, 1000);
        return;
      }
      
      // Check if AI is currently speaking or processing
      if (isAISpeaking.current) {
        console.log('🚫 Skipping: AI is currently speaking');
        return;
      }
      
      // Check if we just processed speech recently (reduced debounce for better responsiveness)
      const now = Date.now();
      if (lastProcessedTime.current && now - lastProcessedTime.current < 1500) {
        console.log('🚫 Skipping: too soon after last response');
        // Restart speech recognition for next input
        setTimeout(async () => {
          if (isInterviewActive && !isListening && !isAISpeaking.current) {
            await startSpeechRecognition();
          }
        }, 1000);
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
      
      // Add to database
      await addTranscriptMessage(userMessage);
      
      // Generate AI response immediately (no delay needed since we stopped recognition)
      try {
        console.log('🤖 Generating AI response...');
        isAISpeaking.current = true; // Set immediately to prevent other speech processing
        
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
        
        console.log('🤖 AI response completed, resetting speaking flag');
        isAISpeaking.current = false;
        
        // Restart speech recognition after AI finishes speaking
        console.log('🔄 Attempting to restart speech recognition after AI response');
        console.log('🔄 Current state:', { 
          isInterviewActive, 
          isListening, 
          isAISpeaking: isAISpeaking.current,
          hasRecognition: !!recognitionRef.current 
        });
        
        if (isInterviewActive && !isListening) {
          console.log('🔄 Restarting speech recognition after AI response');
          setTimeout(async () => {
            console.log('🔄 Timeout fired - checking conditions again');
            console.log('🔄 Conditions check:', { 
              isInterviewActive, 
              isListening, 
              isAISpeaking: isAISpeaking.current,
              hasRecognition: !!recognitionRef.current 
            });
            
            if (isInterviewActive && !isListening && !isAISpeaking.current) {
              console.log('🔄 Actually restarting speech recognition now');
              await startSpeechRecognition();
            } else {
              console.log('🚫 Cannot restart speech recognition - conditions not met');
            }
          }, 1000);
        }
        
      } catch (error) {
        console.error('❌ Error in AI response:', error);
        isAISpeaking.current = false;
        
        // Still restart speech recognition even if AI response failed
        console.log('🔄 Restarting speech recognition after AI error');
        if (isInterviewActive && !isListening) {
          setTimeout(async () => {
            if (isInterviewActive && !isListening && !isAISpeaking.current) {
              await startSpeechRecognition();
            }
          }, 1000);
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing speech:', error);
      isAISpeaking.current = false;
      toast({
        title: "Processing Error",
        description: "Failed to process speech. Please try again.",
        variant: "destructive"
      });
      
      // Restart speech recognition after error
      setTimeout(async () => {
        if (isInterviewActive && !isListening) {
          await startSpeechRecognition();
        }
      }, 1000);
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
      
      // Auto-start speech recognition when interview starts
      console.log('🎯 Auto-starting speech recognition...');
      if (!recognitionRef.current) {
        await initializeSpeechRecognition();
      }
      
      // Ensure speech recognition starts immediately
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
          await initializeSpeechRecognition();
        }
        
        // Start speech recognition automatically
        try {
          if (recognitionRef.current && !isListening && !isMuted) {
            console.log('🚀 Auto-starting speech recognition');
            recognitionRef.current.start();
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('✅ Speech recognition auto-started successfully');
          }
        } catch (error) {
          console.log('❌ Speech recognition auto-start failed:', error);
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
        description: "Microphone is active - you can begin speaking",
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
    
    // Show feedback modal after ending
    setShowFeedbackModal(true);
    
    // End session in manager
    sessionManager.endSession();
    
    // Navigate directly to dashboard 
      navigate('/dashboard');
    
    toast({
      title: "Interview Ended",
      description: "Share your feedback in the dashboard to help us improve!",
    });
  };
  
  // Remove feedback handlers since we're not using popup anymore

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
      
      console.log('💓 Speech heartbeat check:', { 
        isListening, 
        isMuted, 
        isInterviewActive,
        isAISpeaking: isAISpeaking.current,
        hasRecognition: !!recognitionRef.current 
      });
      
      // Keep microphone always active unless muted
      if (!isListening && !isMuted && isInterviewActive && !isAISpeaking.current) {
        console.log('💓 Heartbeat: Microphone not active, force restarting...');
        // Force restart speech recognition to keep it always on
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.log('💓 Error stopping recognition:', e);
          }
        }
        setTimeout(async () => {
          if (!isListening && !isMuted && isInterviewActive && !isAISpeaking.current) {
            console.log('💓 Heartbeat: Force restarting speech recognition to keep mic always on');
            await startSpeechRecognition();
          }
        }, 500);
      }
      
      // Schedule next heartbeat
      heartbeatRef.current = setTimeout(heartbeat, 3000); // Check every 3 seconds
    };
    
    heartbeatRef.current = setTimeout(heartbeat, 3000);
  };

  // Toggle Functions
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState) {
      // Muting - stop speech recognition
      console.log('🔇 Muting microphone - stopping speech recognition');
      stopSpeechRecognition();
    } else if (isInterviewActive) {
      // Unmuting - restart speech recognition immediately
      console.log('🎤 Unmuting microphone - restarting speech recognition');
      setTimeout(async () => {
        if (isInterviewActive && !isListening && !isAISpeaking.current) {
          await startSpeechRecognition();
        }
      }, 500);
    }
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
    };
  }, []);

  // Feedback functions
  const handleFeedbackSubmit = async () => {
    try {
      console.log('Submitting feedback:', feedbackData);
      
      // Here you could save feedback to database
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });
      
      setShowFeedbackModal(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSkipFeedback = () => {
    setShowFeedbackModal(false);
    navigate('/dashboard');
  };

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

      {/* Feedback Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>How was your interview experience?</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Rating */}
            <div>
              <Label className="text-base font-medium">Overall Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                    className="p-1"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= feedbackData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Type */}
            <div>
              <Label className="text-base font-medium">Experience Type</Label>
              <Select 
                value={feedbackData.experience} 
                onValueChange={(value) => setFeedbackData(prev => ({ ...prev, experience: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select experience type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smooth">Smooth & Natural</SelectItem>
                  <SelectItem value="challenging">Challenging but Fair</SelectItem>
                  <SelectItem value="technical-issues">Had Technical Issues</SelectItem>
                  <SelectItem value="too-easy">Too Easy</SelectItem>
                  <SelectItem value="too-difficult">Too Difficult</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Comments */}
            <div>
              <Label className="text-base font-medium">Additional Comments</Label>
              <Textarea
                placeholder="Share your thoughts about the interview experience..."
                value={feedbackData.comments}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, comments: e.target.value }))}
                className="mt-2 min-h-[100px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSkipFeedback} variant="outline" className="flex-1">
                Skip
              </Button>
              <Button onClick={handleFeedbackSubmit} className="flex-1">
                <Send className="w-4 h-4 mr-2" />
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