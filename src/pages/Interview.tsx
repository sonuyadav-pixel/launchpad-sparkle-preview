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
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [localTranscript, setLocalTranscript] = useState<TranscriptMessage[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  
  // Conversation flow control
  const lastProcessedTime = useRef<number>(0);
  const isAISpeaking = useRef(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  
  
  // Speech finalization timer
  const speechFinalizationTimer = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscript = useRef('');
  const pendingTranscript = useRef('');
  
  // Smart word accumulation helper function
  const appendNewWords = useCallback((existingText: string, incomingText: string): string => {
    if (!existingText.trim()) return incomingText.trim();
    if (!incomingText.trim()) return existingText.trim();
    
    const existingWords = existingText.trim().split(/\s+/);
    const incomingWords = incomingText.trim().split(/\s+/);
    
    // Find where the overlap ends and new words begin
    let overlapIndex = 0;
    for (let i = 0; i < Math.min(existingWords.length, incomingWords.length); i++) {
      if (existingWords[existingWords.length - 1 - i]?.toLowerCase() === 
          incomingWords[incomingWords.length - 1 - i]?.toLowerCase()) {
        overlapIndex = i + 1;
      } else {
        break;
      }
    }
    
    // Extract only the new words
    const newWords = incomingWords.slice(0, incomingWords.length - overlapIndex);
    
    // If no new words, return existing text
    if (newWords.length === 0) return existingText.trim();
    
    // Append new words to existing text
    return `${existingText.trim()} ${newWords.join(' ')}`.trim();
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

  const ensureSpeechRecognitionActive = useCallback(async (retryCount = 0) => {
    console.log(`🔧 Ensuring speech recognition is active (attempt ${retryCount + 1})`);
    
    if (!isInterviewActive) {
      console.log('❌ Interview not active, skipping speech recognition');
      return false;
    }

    // Check if already listening
    if (recognitionRef.current && isListening) {
      console.log('✅ Speech recognition already active');
      return true;
    }

    // Request microphone permission first
    console.log('🎤 Requesting microphone permission for speech recognition...');
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      console.log('❌ No microphone permission, cannot start speech recognition');
      return false;
    }

    // Initialize if needed
    if (!recognitionRef.current) {
      console.log('🔧 Initializing speech recognition...');
      const initialized = initializeSpeechRecognition();
      if (!initialized) {
        console.log('❌ Failed to initialize speech recognition');
        return false;
      }
    }

    // Start speech recognition with retries
    try {
      console.log('🎤 Starting speech recognition...');
      recognitionRef.current.start();
      
      // Wait a bit and verify it started
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!isListening && retryCount < 5) {
        console.log('🔄 Speech recognition didn\'t start, retrying...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
        return ensureSpeechRecognitionActive(retryCount + 1);
      }
      
      if (isListening) {
        console.log('✅ Speech recognition started successfully');
        return true;
      } else {
        console.log('❌ Speech recognition failed to start after all attempts');
        return false;
      }
    } catch (error) {
      console.log('❌ Failed to start speech recognition:', error);
      
      if (retryCount < 5) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`🔄 Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return ensureSpeechRecognitionActive(retryCount + 1);
      }
      
      console.error("Speech Recognition Failed: Unable to start speech recognition after all attempts");
      return false;
    }
  }, [isInterviewActive, isListening, requestMicrophonePermission]);

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
      
      // Aggressive auto-restart with multiple attempts
      if (isInterviewActive && !isMuted) {
        console.log('🔄 Auto-restarting speech recognition...');
        setTimeout(() => {
          console.log('🔄 Attempting to restart speech recognition...');
          ensureSpeechRecognitionActive();
        }, 500);
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
      
      // Handle final transcript - use smart append to avoid duplication
      if (finalTranscript.trim()) {
        accumulatedTranscript.current = appendNewWords(accumulatedTranscript.current, finalTranscript.trim());
        console.log('📝 Added final transcript to accumulation:', accumulatedTranscript.current);
      }
      
      // Handle interim transcript - show current speech + accumulated
      if (interimTranscript.trim()) {
        // For interim results, just append to accumulated transcript
        const displayTranscript = accumulatedTranscript.current.trim() 
          ? `${accumulatedTranscript.current} ${interimTranscript.trim()}` 
          : interimTranscript.trim();
        
        // Update live display and pending transcript
        setCurrentTranscript(displayTranscript);
        pendingTranscript.current = displayTranscript;
        
        // Reset 10-second timer whenever we get new speech
        
        // Clear existing timer and start new 10-second timer
        if (speechFinalizationTimer.current) {
          clearTimeout(speechFinalizationTimer.current);
        }
        
        speechFinalizationTimer.current = setTimeout(() => {
          if (pendingTranscript.current.trim()) {
            const textToFinalize = pendingTranscript.current.trim();
            const wordCount = countWords(textToFinalize);
            
            // If word count is <= 2, wait longer for more words (unless it's been too long)
            if (wordCount <= 2) {
              console.log(`📝 Short utterance detected (${wordCount} words), waiting longer for more input...`);
              
              // Set another timeout for short utterances, but with a maximum wait time
              speechFinalizationTimer.current = setTimeout(() => {
                if (pendingTranscript.current.trim()) {
                  console.log('📝 Extended wait complete, finalizing short transcript:', pendingTranscript.current);
                  const finalText = pendingTranscript.current.trim();
                  
                  // Clear all transcript states
                  pendingTranscript.current = '';
                  accumulatedTranscript.current = '';
                  setCurrentTranscript('');
                  
                  lastSpeechTime.current = Date.now();
                  resetAutoCloseTimer();
                  
                  // Process complete accumulated user speech
                  processCompleteUserSpeech(finalText);
                }
              }, 8000); // Additional 8 seconds for short utterances
              return;
            }
            
            console.log(`📝 Silence detected, finalizing transcript (${wordCount} words):`, textToFinalize);
            
            // Clear all transcript states
            pendingTranscript.current = '';
            accumulatedTranscript.current = '';
            setCurrentTranscript('');
            
            lastSpeechTime.current = Date.now();
            resetAutoCloseTimer();
            
            // Process complete accumulated user speech
            processCompleteUserSpeech(textToFinalize);
          }
        }, getDynamicTimeout(countWords(pendingTranscript.current)));
      }
      
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('🎤 Speech recognition error:', event.error);
      
      // Don't show error for network issues, just restart
      if (event.error === 'network' || event.error === 'service-not-allowed' || event.error === 'bad-grammar') {
        console.log('🔄 Network/service error, will auto-restart...');
        return;
      }
      
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
        return;
      }
      
      // For other errors, try to restart after a delay
      setTimeout(() => {
        if (isInterviewActive && recognitionRef.current && !isListening) {
          console.log('🔄 Recovering from error, restarting recognition...');
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error('🚨 Failed to restart after error:', error);
          }
        }
      }, 2000);
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
      
      if (aiResponse && !isAISpeaking.current) {
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
      
      // CRITICAL: Set interview as active FIRST 
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
      
      // Start video (optional, don't block on failure)
      try {
        await startVideo();
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
      const speechStarted = await ensureSpeechRecognitionActive();
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
      
      // Welcome message (TTS failure should not affect interview)
      const welcomeMessage = "Hello! Welcome to your AI interview. Please introduce yourself and tell me about your background.";
      
      const aiMessage: TranscriptMessage = {
        id: Date.now().toString(),
        speaker: 'ai',
        message: welcomeMessage,
        timestamp: new Date()
      };
      
      setLocalTranscript(prev => [aiMessage, ...prev]);
      
      // Try TTS but don't fail interview if it doesn't work
      try {
        await Promise.all([
          addTranscriptMessage(aiMessage),
          speak(welcomeMessage, 'alloy')
        ]);
      } catch (ttsError) {
        console.warn('⚠️ TTS failed but interview continues:', ttsError);
        // Just add to transcript database without TTS
        try {
          await addTranscriptMessage(aiMessage);
        } catch (dbError) {
          console.warn('⚠️ Database save failed:', dbError);
        }
      }
      
      console.log('✅ Interview started successfully');
      
    } catch (error) {
      console.error('❌ Critical error starting interview:', error);
      setIsInterviewActive(false);
      
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
    
    if (speechFinalizationTimer.current) {
      clearTimeout(speechFinalizationTimer.current);
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

  // Speech Recognition Heartbeat to ensure it stays active with enhanced monitoring
  const setupSpeechHeartbeat = () => {
    const heartbeat = async () => {
      if (!isInterviewActive) return;
      
      console.log('💓 Heartbeat check - isListening:', isListening, 'isMuted:', isMuted);
      
      // More aggressive heartbeat - ensure speech recognition is always active when not muted
      if (!isListening && isInterviewActive && !isMuted) {
        console.log('💓 Heartbeat: Speech recognition not active, ensuring it starts...');
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
      if (speechFinalizationTimer.current) {
        clearTimeout(speechFinalizationTimer.current);
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