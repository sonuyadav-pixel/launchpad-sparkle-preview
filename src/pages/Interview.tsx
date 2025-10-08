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
import { useVideoRecording } from '@/hooks/useVideoRecording';
import { useTranscriptSave } from '@/hooks/useTranscriptSave';
import { sessionManager } from '@/utils/SessionManager';
import { useUserProfile } from '@/hooks/useUserProfile';
import PermissionRequest from '@/components/interview/PermissionRequest';
import { UpcomingInterviewSection } from '@/components/dashboard/modules/UpcomingInterviewSection';
import type { InterviewSessionStatus } from '@/types/interview';
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
  const { updateSession, createSession, joinSession } = useInterviewSession();
  const { user } = useUserProfile();

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(searchParams.get('session'));
  const [session, setSession] = useState(null);
  const [isInitializingSession, setIsInitializingSession] = useState(false);
  
  // Video recording and transcript saving
  const { isRecording, isUploading, startRecording, stopRecording } = useVideoRecording({
    sessionId: sessionId || '',
    userId: user?.id || ''
  });
  const { saveTranscriptToFile } = useTranscriptSave({
    sessionId: sessionId || '',
    userId: user?.id || ''
  });
  
  // UI state
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const [localTranscript, setLocalTranscript] = useState<TranscriptMessage[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const isInterviewActiveRef = useRef(false);
  
  // Conversation flow control
  const lastProcessedTime = useRef<number>(0);
  const isAISpeaking = useRef(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  
  
  // Speech finalization timer
  const speechFinalizationTimer = useRef<NodeJS.Timeout | null>(null);
  const acknowledgmentTimer = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscript = useRef('');
  const pendingTranscript = useRef('');
  const hasAcknowledgedCurrent = useRef(false);
  
  // Smart word accumulation helper function - simple append approach
  const appendNewWords = useCallback((existingText: string, incomingText: string): string => {
    if (!existingText.trim()) return incomingText.trim();
    if (!incomingText.trim()) return existingText.trim();
    
    // Simple approach: just append new text with a space
    // The speech recognition API handles duplicates internally
    return `${existingText.trim()} ${incomingText.trim()}`.trim();
  }, []);

  // Word count helper function
  const countWords = useCallback((text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, []);

  // Dynamic timeout based on word count
  const getDynamicTimeout = useCallback((wordCount: number): number => {
    if (wordCount <= 2) return 18000; // 18 seconds for very short utterances
    if (wordCount <= 5) return 10000; // 10 seconds for medium utterances  
    return 7000; // 7 seconds for longer utterances
  }, []);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTime = useRef<number>(Date.now());
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Permission and Auto-Start Functions
  const requestMicrophonePermission = useCallback(async () => {
    console.log('🎤 Requesting microphone permission...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately after getting permission
      console.log('✅ Microphone permission granted');
      return true;
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use speech recognition",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Simple heartbeat to ensure speech recognition stays active
  const ensureSpeechRecognitionActive = useCallback(() => {
    if (!isInterviewActive || isMuted) {
      return false;
    }
    
    // Only start if not already active and not in process of starting
    if (!speechRecognitionState.current.isActive && !speechRecognitionState.current.isStarting) {
      console.log('🔧 Heartbeat: Starting speech recognition...');
      
      const now = Date.now();
      
      // Prevent rapid restart attempts (debounce)
      if (now - speechRecognitionState.current.lastStartAttempt < 500) {
        return true; // Return true to indicate we're handling it
      }
      
      speechRecognitionState.current.lastStartAttempt = now;
      
      // Check if already active or starting
      if (speechRecognitionState.current.isActive || speechRecognitionState.current.isStarting) {
        return true;
      }
      
      // We'll start it after initialization is available
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            speechRecognitionState.current.isStarting = true;
            recognitionRef.current.start();
          } catch (error) {
            console.error('❌ Heartbeat failed to start speech recognition:', error);
            speechRecognitionState.current.isStarting = false;
            
            if (error.name === 'InvalidStateError') {
              speechRecognitionState.current.isActive = true;
              setIsListening(true);
            }
          }
        }
      }, 10);
    }
    return true;
  }, [isInterviewActive, isMuted]);

  // Speech Recognition State Management
  const speechRecognitionState = useRef({
    isInitializing: false,
    isStarting: false,
    isActive: false,
    lastStartAttempt: 0,
    manuallyStopped: false
  });

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

    // Prevent multiple initializations
    if (speechRecognitionState.current.isInitializing) {
      console.log('🔄 Already initializing speech recognition, skipping...');
      return true;
    }

    speechRecognitionState.current.isInitializing = true;

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
      speechRecognitionState.current.isActive = true;
      speechRecognitionState.current.isStarting = false;
      setIsListening(true);
      lastSpeechTime.current = Date.now();
    };

    recognitionRef.current.onend = () => {
      console.log('🎤 Speech recognition ENDED');
      speechRecognitionState.current.isActive = false;
      speechRecognitionState.current.isStarting = false;
      setIsListening(false);
      
      // Continuous listening: Always auto-restart unless manually stopped or interview ended
      const shouldRestart = isInterviewActiveRef.current && !isMutedRef.current && !speechRecognitionState.current.manuallyStopped;
      
      if (shouldRestart) {
        console.log('🔄 [CONTINUOUS] Auto-restarting speech recognition immediately...');
        // Immediate restart for continuous listening
        setTimeout(() => {
          // Check again with current values
          if (isInterviewActiveRef.current && !isMutedRef.current && !speechRecognitionState.current.isStarting && !speechRecognitionState.current.isActive) {
            console.log('🎯 [CONTINUOUS] Restarting now...');
            startSpeechRecognitionSafe();
          }
        }, 300); // Reduced to 300ms for more responsive continuous listening
      } else {
        console.log('🚫 Not restarting:', { 
          isInterviewActive: isInterviewActiveRef.current, 
          isMuted: isMutedRef.current, 
          manuallyStopped: speechRecognitionState.current.manuallyStopped 
        });
      }
    };

    recognitionRef.current.onresult = (event: any) => {
      console.log('🎤 Speech result received');
      let finalTranscript = '';
      let interimTranscript = '';
      
      // Process only NEW results starting from resultIndex to avoid duplicates
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Handle final transcript - always append to accumulated
      if (finalTranscript.trim()) {
        // Simple append with space if we have existing text
        if (accumulatedTranscript.current.trim()) {
          accumulatedTranscript.current = accumulatedTranscript.current.trim() + ' ' + finalTranscript.trim();
        } else {
          accumulatedTranscript.current = finalTranscript.trim();
        }
        console.log('📝 Added final transcript, total accumulated:', accumulatedTranscript.current);
      }
      
      // Handle interim transcript - show current speech + accumulated
      if (interimTranscript.trim()) {
        // Combine accumulated final words with current interim words
        const displayTranscript = accumulatedTranscript.current.trim() 
          ? `${accumulatedTranscript.current} ${interimTranscript.trim()}` 
          : interimTranscript.trim();
        
        // Update live display and pending transcript
        setCurrentTranscript(displayTranscript);
        pendingTranscript.current = displayTranscript;
        
        // Reset 10-second timer whenever we get new speech
        // Clear acknowledgment flag for new speech
        hasAcknowledgedCurrent.current = false;
        
        // Clear existing timers and start new 10-second journey
        if (speechFinalizationTimer.current) {
          clearTimeout(speechFinalizationTimer.current);
        }
        if (acknowledgmentTimer.current) {
          clearTimeout(acknowledgmentTimer.current);
        }
        
        // Start 3-segment journey: 5s silence → "Sure" → 5s more silence → finalize
        console.log('🎯 Starting 10-second journey: Segment 1 (0-5s silence) → Segment 2 (5s "Sure") → Segment 3 (5s more silence)');
        
        // Segment 2: Trigger acknowledgment at 5 seconds
        acknowledgmentTimer.current = setTimeout(() => {
          console.log('🎯 Segment 2: 5 seconds reached - triggering acknowledgment');
          triggerAcknowledgment();
        }, 5000);
        
        // Segment 3: Finalize speech at 10 seconds (full journey)
        speechFinalizationTimer.current = setTimeout(() => {
          if (pendingTranscript.current.trim()) {
            const textToFinalize = pendingTranscript.current.trim();
            
            console.log(`🎯 Segment 3: 10-second journey complete, finalizing transcript:`, textToFinalize);
            
            // Clear all transcript states
            pendingTranscript.current = '';
            accumulatedTranscript.current = '';
            setCurrentTranscript('');
            hasAcknowledgedCurrent.current = false;
            
            lastSpeechTime.current = Date.now();
            resetAutoCloseTimer();
            
            // Process complete accumulated user speech
            processCompleteUserSpeech(textToFinalize);
          }
        }, 10000); // Fixed 10-second timeout for the complete journey
      }
      
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('🎤 Speech recognition error:', event.error);
      speechRecognitionState.current.isActive = false;
      speechRecognitionState.current.isStarting = false;
      
      // Handle different error types
      if (event.error === 'aborted') {
        console.log('⚠️ Speech recognition aborted - will auto-restart via onend');
        return; // Don't restart here, let onend handle it
      }
      
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access",
          variant: "destructive"
        });
        return;
      }
      
      if (event.error === 'audio-capture') {
        toast({
          title: "Microphone Issue",
          description: "Audio capture error",
          variant: "destructive"
        });
        return;
      }
      
      // For other errors (network, no-speech, service), just log
      console.warn('⚠️ Speech recognition error:', event.error);
    };

    speechRecognitionState.current.isInitializing = false;
    return true;
  }, [isInterviewActive, isMuted]);

  // Safe speech recognition start with proper state management
  const startSpeechRecognitionSafe = useCallback(() => {
    const now = Date.now();
    
    // Reduced debounce for continuous listening
    if (now - speechRecognitionState.current.lastStartAttempt < 500) {
      console.log('🚫 Preventing rapid restart attempt');
      return;
    }
    
    speechRecognitionState.current.lastStartAttempt = now;
    
    // Check if already active or starting
    if (speechRecognitionState.current.isActive || speechRecognitionState.current.isStarting) {
      console.log('🚫 Speech recognition already active or starting');
      return;
    }
    
    // Check if interview is active
    if (!isInterviewActive || isMuted) {
      console.log('🚫 Interview not active or muted, not starting speech recognition');
      return;
    }
    
    // Initialize if needed
    if (!recognitionRef.current) {
      if (!initializeSpeechRecognition()) {
        console.log('❌ Failed to initialize speech recognition');
        return;
      }
    }

    try {
      console.log('🚀 Starting speech recognition safely...');
      speechRecognitionState.current.isStarting = true;
      recognitionRef.current.start();
    } catch (error) {
      console.error('❌ Failed to start speech recognition:', error);
      speechRecognitionState.current.isStarting = false;
      
      // Handle specific error cases
      if (error.name === 'InvalidStateError') {
        console.log('🔄 Recognition already started, updating state...');
        speechRecognitionState.current.isActive = true;
        setIsListening(true);
        return;
      }
      
      // For other errors, reset and try again after delay
      setTimeout(() => {
        if (isInterviewActive && !isMuted) {
          console.log('🔄 Reinitializing speech recognition after error...');
          recognitionRef.current = null;
          speechRecognitionState.current = {
            isInitializing: false,
            isStarting: false,
            isActive: false,
            lastStartAttempt: 0,
            manuallyStopped: false
          };
          startSpeechRecognitionSafe();
        }
      }, 1000);
    }
  }, [initializeSpeechRecognition, isInterviewActive, isMuted]);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current && (speechRecognitionState.current.isActive || speechRecognitionState.current.isStarting)) {
      console.log('🛑 Stopping speech recognition...');
      speechRecognitionState.current.isActive = false;
      speechRecognitionState.current.isStarting = false;
      speechRecognitionState.current.manuallyStopped = true;
      recognitionRef.current.stop();
    }
  }, []);

  // Trigger acknowledgment during 10-second silence (segment 2)
  const triggerAcknowledgment = useCallback(async () => {
    if (hasAcknowledgedCurrent.current || !isInterviewActive) {
      return;
    }

    try {
      console.log('🎯 Segment 2: Triggering acknowledgment - AI says "Sure"');
      hasAcknowledgedCurrent.current = true;

      // Add "Sure" to transcript
      const acknowledgmentMessage: TranscriptMessage = {
        id: Date.now().toString(),
        speaker: 'ai',
        message: 'Sure',
        timestamp: new Date()
      };

      setLocalTranscript(prev => [acknowledgmentMessage, ...prev]);
      
      // Save to database
      await addTranscriptMessage(acknowledgmentMessage);

      // Speak "Sure" using TTS
      await speak('Sure', 'alloy');

    } catch (error) {
      console.error('❌ Error in acknowledgment:', error);
    }
  }, [isInterviewActive, speak]);

  // Process complete user speech with parallel transcript saving and AI response generation
  const processCompleteUserSpeech = async (transcript: string) => {
    try {
      console.log('🧠 Processing complete user speech:', transcript);
      
      // Skip if transcript is too short
      if (transcript.length < 3) {
        console.log('🚫 Skipping: transcript too short');
        return;
      }
      
      // Check if we just processed speech recently (debounce - 1 second)
      const now = Date.now();
      if (lastProcessedTime.current && now - lastProcessedTime.current < 1000) {
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
      
      // PARALLEL: Add to transcript database AND generate AI response
      const [, aiResponse] = await Promise.all([
        addTranscriptMessage(userMessage),
        generateAIResponse(transcript)
      ]);
      
      console.log('✅ AI Response received:', aiResponse?.substring(0, 100));
      console.log('🔊 isAISpeaking.current:', isAISpeaking.current);
      
      if (aiResponse) {
        // Mark AI as speaking before starting TTS (but keep speech recognition running)
        isAISpeaking.current = true;
        
        const aiMessage: TranscriptMessage = {
          id: (Date.now() + 1).toString(),
          speaker: 'ai',
          message: aiResponse,
          timestamp: new Date()
        };
        
        setLocalTranscript(prev => [aiMessage, ...prev]);
        
        try {
          // PARALLEL: Add AI response to database AND start TTS conversion
          const [, ] = await Promise.all([
            addTranscriptMessage(aiMessage),
            speak(aiResponse, 'alloy').catch((ttsError) => {
              console.warn('⚠️ TTS failed, continuing without audio:', ttsError);
              // Don't throw error, just log it - interview can continue without TTS
              return null;
            })
          ]);
          
          console.log('🤖 AI finished speaking');
          isAISpeaking.current = false;
          
        } catch (error) {
          console.error('❌ Error in AI response processing:', error);
          isAISpeaking.current = false;
          // Don't show toast for TTS errors - they're not critical for interview flow
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing complete speech:', error);
      isAISpeaking.current = false;
      toast({
        title: "Processing Error",
        description: "Failed to process speech. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Legacy function for backward compatibility - now redirects to complete speech processing
  const processUserSpeech = async (transcript: string) => {
    await processCompleteUserSpeech(transcript);
  };

  // Generate AI response using EC2 backend
  const generateAIResponse = async (userInput: string): Promise<string> => {
    try {
      console.log('🤖 Generating AI response from EC2 backend for:', userInput);
      console.log('📋 Current session ID:', sessionId);
      
      // Call EC2 backend for next question
      const { data, error } = await supabase.functions.invoke('ec2-interview', {
        body: { 
          action: 'next',
          userId: sessionId,
          answer: userInput
        }
      });

      console.log('📥 EC2 response:', { data, error });

      if (error) {
        console.error('🤖 EC2 API error:', error);
        toast({
          title: "AI Response Error",
          description: `Failed to get AI response: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }

      if (!data?.question) {
        console.error('❌ No question in data:', data);
        toast({
          title: "AI Response Error",
          description: "No response received from AI",
          variant: "destructive"
        });
        throw new Error('No response received from AI');
      }

      const responseText = data.question;
      console.log(`✅ Generated response: ${responseText.substring(0, 100)}...`);
      
      // Check if interview is complete
      if (data.isComplete) {
        console.log('🎉 Interview completed!');
        toast({
          title: "Interview Complete",
          description: "Thank you for completing the interview!",
        });
      }
      
      return responseText;
      
    } catch (error) {
      console.error('❌ Error generating AI response:', error);
      toast({
        title: "AI Error",
        description: "Failed to generate AI response. Please try speaking again.",
        variant: "destructive"
      });
      return "I'm sorry, I didn't catch that. Could you please repeat?";
    }
  };

  // Add transcript message to database
  const addTranscriptMessage = async (message: TranscriptMessage) => {
    if (!sessionId) {
      console.warn('⚠️ No session ID available, skipping transcript save');
      return;
    }
    
    try {
      const { error } = await supabase.functions.invoke('interview-session', {
        body: {
          action: 'add-transcript',
          session_id: sessionId,
          speaker: message.speaker,
          message: message.message,
          metadata: {}
        }
      });
      
      if (error) {
        console.error('❌ Error saving transcript:', error);
      }
    } catch (error) {
      console.error('❌ Exception saving transcript:', error);
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
    
    console.log('🔍 Session check:', { hasActive, activeId, currentSessionId: sessionId });
    
    // If there's a different active session, end it first
    if (hasActive && activeId !== sessionId) {
      console.log('🧹 Ending stale session:', activeId);
      sessionManager.endSession();
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
      
      // CRITICAL: Set interview as active FIRST 
      setIsInterviewActive(true);
      isInterviewActiveRef.current = true;
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
      
      // Start video (optional, don't block on failure)
      try {
        await startVideo();
        
        // Start video recording if stream is available
        if (streamRef.current) {
          await startRecording(streamRef.current);
        }
      } catch (videoError) {
        console.warn('⚠️ Video failed to start, continuing without video:', videoError);
      }
      
      // Set active session in session manager
      if (sessionId) {
        sessionManager.setActiveSession(
          sessionId, 
          streamRef.current, 
          recognitionRef.current,
          "AI Interview Session"
        );
      }
      
      // CRITICAL: Start speech recognition IMMEDIATELY with aggressive retries
      console.log('🎯 Starting speech recognition IMMEDIATELY...');
      const speechStarted = ensureSpeechRecognitionActive();
      if (!speechStarted) {
        console.error('❌ CRITICAL: Speech recognition failed to start!');
        // Don't fail the entire interview, but show warning
        toast({
          title: "Microphone Issue",
          description: "Speech recognition may not be working. Please check your microphone.",
          variant: "destructive"
        });
      }
      
      // Start monitoring systems
      setupSpeechHeartbeat();
      setupSilenceDetection();
      
      // Check if this is a scheduled interview with CV/JD files
      const scheduledInterviewId = searchParams.get('scheduled');
      let welcomeMessage = "Hello! Welcome to your AI interview. Please introduce yourself and tell me about your background.";
      
      if (scheduledInterviewId) {
        try {
          console.log('🔍 Fetching scheduled interview details:', scheduledInterviewId);
          
          // Get scheduled interview details
          const { data: interviews } = await supabase.functions.invoke('scheduled-interviews', {
            method: 'GET'
          });
          
          const scheduledInterview = interviews?.find((i: any) => i.id === scheduledInterviewId);
          
          if (scheduledInterview?.cv_file_path && scheduledInterview?.jd_file_path) {
            console.log('📋 Initializing EC2 interview with CV and JD...');
            
            // Initialize EC2 interview
            const { data: initData, error: initError } = await supabase.functions.invoke('ec2-interview', {
              body: {
                action: 'init',
                userId: sessionId,
                cvFilePath: scheduledInterview.cv_file_path,
                jdFilePath: scheduledInterview.jd_file_path
              }
            });
            
            if (!initError && initData?.question) {
              welcomeMessage = initData.question;
              console.log('✅ EC2 interview initialized with custom first question');
            } else {
              console.warn('⚠️ EC2 initialization failed, using default welcome:', initError);
            }
          }
        } catch (ec2Error) {
          console.warn('⚠️ Failed to initialize EC2 interview, using default flow:', ec2Error);
        }
      }
      
      const aiMessage: TranscriptMessage = {
        id: Date.now().toString(),
        speaker: 'ai',
        message: welcomeMessage,
        timestamp: new Date()
      };
      
      setLocalTranscript(prev => [aiMessage, ...prev]);
      
      // Try TTS but don't fail interview if it doesn't work
      try {
        await addTranscriptMessage(aiMessage);
        
        // Speak welcome message (non-blocking)
        speak(welcomeMessage, 'alloy').catch((ttsError) => {
          console.warn('⚠️ TTS failed for welcome message:', ttsError);
          toast({
            title: "Audio Unavailable",
            description: "Text-to-speech is currently unavailable. Interview will continue with text only.",
            variant: "default"
          });
        });
      } catch (dbError) {
        console.warn('⚠️ Database save failed:', dbError);
      }
      
      console.log('✅ Interview started successfully');
      
    } catch (error) {
      console.error('❌ Critical error starting interview:', error);
      setIsInterviewActive(false);
      isInterviewActiveRef.current = false;
      
      toast({
        title: "Interview Start Failed",
        description: error instanceof Error ? error.message : 'Failed to start interview. Please try again.',
        variant: "destructive"
      });
    }
  };
  const endInterview = async () => {
    console.log('🏁 Ending interview...');
    
    setIsInterviewActive(false);
    isInterviewActiveRef.current = false;
    stopSpeechRecognition();
    
    // Stop and save video recording
    if (isRecording) {
      console.log('💾 Saving video recording...');
      await stopRecording();
    }
    
    // Save transcript to file
    if (localTranscript.length > 0) {
      console.log('💾 Saving transcript...');
      await saveTranscriptToFile(localTranscript.slice().reverse()); // Reverse to get chronological order
    }
    
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
    
    if (speechFinalizationTimer.current) {
      clearTimeout(speechFinalizationTimer.current);
    }
    
    if (acknowledgmentTimer.current) {
      clearTimeout(acknowledgmentTimer.current);
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
    
    // End session in manager
    sessionManager.endSession();
    
    toast({
      title: "Interview Ended",
      description: "Thank you for your time! Your video and transcript have been saved.",
    });

    // Navigate to dashboard with feedback modal
    navigate('/dashboard?feedback=true');
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

  // Speech Recognition Heartbeat to ensure it stays active with enhanced monitoring
  const setupSpeechHeartbeat = () => {
    const heartbeat = async () => {
      if (!isInterviewActive) return;
      
      console.log('💓 Heartbeat check - isListening:', isListening, 'isMuted:', isMuted);
      
      // ULTRA-AGGRESSIVE heartbeat - FORCE speech recognition to be always active when not muted
      if (!isListening && isInterviewActive && !isMuted) {
        console.log('💪 FORCE HEARTBEAT: Speech recognition not active, FORCEFULLY ensuring it starts...');
        await ensureSpeechRecognitionActive();
      }
      
      // Additional check - ensure speech recognition state is consistent
      if (isInterviewActive && !isMuted && speechRecognitionState.current.isActive !== isListening) {
        console.log('💪 FORCE HEARTBEAT: State mismatch detected, forcing restart...');
        await ensureSpeechRecognitionActive();
      }
      
      // Also check microphone permissions periodically
      if (isInterviewActive && !isMuted) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (permissionStatus.state === 'denied') {
            console.log('💓 Heartbeat: Microphone permission denied');
            toast({
              title: "Microphone Access Lost",
              description: "Please refresh and allow microphone access",
              variant: "destructive"
            });
          }
        } catch (error) {
          // Some browsers don't support permissions API
          console.log('💓 Permissions API not supported');
        }
      }
      
      // Schedule next heartbeat - check every 2 seconds for more aggressive monitoring
      heartbeatRef.current = setTimeout(heartbeat, 2000);
    };
    
    // Start heartbeat immediately and then every 2 seconds
    heartbeatRef.current = setTimeout(heartbeat, 500);
  };

  // Toggle Functions with enhanced auto-start
  const toggleMute = async () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    isMutedRef.current = newMutedState;
    
    if (newMutedState) {
      // Muting - stop speech recognition
      stopSpeechRecognition();
    } else if (isInterviewActive) {
      // Unmuting - ensure speech recognition starts robustly
      console.log('🔊 Unmuting - ensuring speech recognition starts...');
      setTimeout(async () => {
        await ensureSpeechRecognitionActive();
      }, 500);
    }
  };

  // Initialize or load session on mount
  useEffect(() => {
    const initializeSession = async () => {
      if (isInitializingSession) return;
      
      const urlSessionId = searchParams.get('session');
      
      if (urlSessionId) {
        // Load existing session
        console.log('📁 Loading session from URL:', urlSessionId);
        setSessionId(urlSessionId);
        
        // Check if there's an active session in the manager
        const hasActive = sessionManager.hasActiveSession();
        const activeId = sessionManager.getActiveSessionId();
        
        if (hasActive && activeId === urlSessionId) {
          console.log('🔄 Restoring active session from manager');
          setIsInterviewActive(true);
          isInterviewActiveRef.current = true;
        }
        
        // Try to load session details
        try {
          await joinSession(urlSessionId);
        } catch (error) {
          console.error('Failed to load session:', error);
        }
      } else if (user) {
        // Create new session if no session ID in URL
        console.log('🆕 No session ID in URL, creating new session...');
        setIsInitializingSession(true);
        
        try {
          const newSession = await createSession({
            title: 'AI Interview Session',
            interview_type: 'general',
            settings: {},
            metadata: {}
          });
          
          if (newSession?.id) {
            console.log('✅ Created new session:', newSession.id);
            setSessionId(newSession.id);
            setSession(newSession);
            
            // Update URL with new session ID
            navigate(`/interview?session=${newSession.id}`, { replace: true });
          } else {
            throw new Error('Failed to create session - no ID returned');
          }
        } catch (error) {
          console.error('❌ Failed to create session:', error);
          toast({
            title: "Session Error",
            description: "Failed to create interview session. Redirecting to dashboard.",
            variant: "destructive"
          });
          
          // Redirect to dashboard after error
          setTimeout(() => navigate('/dashboard'), 2000);
        } finally {
          setIsInitializingSession(false);
        }
      }
    };
    
    initializeSession();
  }, [searchParams, user, isInitializingSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up interview component');
      stopVideo();
      stopSpeechRecognition();
      
      // Clear session manager and mark as abandoned if user left without ending properly
      const activeId = sessionManager.getActiveSessionId();
      if (activeId === sessionId && isInterviewActive) {
        console.log('🧹 User left without ending - marking as abandoned:', activeId);
        
        // Update session as abandoned in database
        updateSession(sessionId, { 
          status: 'abandoned' as any,
          ended_at: new Date().toISOString(),
          metadata: { reason: 'user_left_without_ending' }
        }).catch(error => {
          console.error('Failed to update session as abandoned:', error);
        });
        
        sessionManager.endSession();
      }
      
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (heartbeatRef.current) {
        clearTimeout(heartbeatRef.current);
      }
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
      if (speechFinalizationTimer.current) {
        clearTimeout(speechFinalizationTimer.current);
      }
      if (acknowledgmentTimer.current) {
        clearTimeout(acknowledgmentTimer.current);
      }
    };
  }, [sessionId, isInterviewActive, updateSession]);

  return (
    <div className="min-h-screen bg-primary/10 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border border-border">
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

        {/* Upcoming Interview Section - Shows if user has invited interviews */}
        {!isInterviewActive && <UpcomingInterviewSection />}

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
                        startSpeechRecognitionSafe();
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