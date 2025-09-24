import { useState, useRef, useCallback, useEffect } from 'react';
import { useAdvancedTTS } from './useAdvancedTTS';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useInterviewSession } from './useInterviewSession';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type InterviewState = 'idle' | 'introduction' | 'questioning' | 'waiting_response' | 'processing' | 'completed';

interface TranscriptEntry {
  id: string;
  speaker: 'ai' | 'user';
  message: string;
  timestamp: Date;
  isFinal: boolean;
}

interface InterviewFlowResult {
  startInterview: (sessionId: string) => Promise<void>;
  endInterview: () => Promise<void>;
  pauseInterview: () => void;
  resumeInterview: () => void;
  interviewState: InterviewState;
  currentQuestion: string;
  transcript: TranscriptEntry[];
  isAISpeaking: boolean;
  isUserSpeaking: boolean;
  questionCount: number;
}

const INITIAL_QUESTIONS = [
  "Hello! I'm your AI interviewer. Let's start with a simple question - can you please introduce yourself and tell me about your background?",
  "What motivated you to apply for this position?",
  "Can you describe a challenging project you've worked on recently?",
  "What are your greatest strengths and how do they relate to this role?",
  "Where do you see yourself in five years?"
];

export const useInterviewFlow = (): InterviewFlowResult => {
  const { toast } = useToast();
  const [interviewState, setInterviewState] = useState<InterviewState>('idle');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  
  const questionIndexRef = useRef(0);
  const conversationHistoryRef = useRef<string[]>([]);
  const interruptedQuestionRef = useRef<string | null>(null);
  const userResponseBufferRef = useRef<string>('');
  const responseTimeoutRef = useRef<NodeJS.Timeout>();
  
  // New refs for 10-second silence detection and speech accumulation
  const accumulatedSpeechRef = useRef<string>('');
  const silenceTimeoutRef = useRef<NodeJS.Timeout>();
  const currentTranscriptEntryIdRef = useRef<string | null>(null);

  // Initialize hooks
  const tts = useAdvancedTTS();
  const { addTranscriptMessage } = useInterviewSession();
  
  // Speech recognition without VAD
  const speechRecognition = useSpeechRecognition();

  // Add transcript entry helper with improved accumulation support
  const addToTranscript = useCallback((speaker: 'ai' | 'user', message: string, isFinal: boolean = true, entryId?: string) => {
    const entry: TranscriptEntry = {
      id: entryId || `${Date.now()}-${Math.random()}`,
      speaker,
      message,
      timestamp: new Date(),
      isFinal
    };

    setTranscript(prev => {
      if (!isFinal && speaker === 'user') {
        // For interim user speech, update or create single accumulating entry
        const withoutCurrentUserEntry = prev.filter(t => t.id !== currentTranscriptEntryIdRef.current);
        currentTranscriptEntryIdRef.current = entry.id;
        return [...withoutCurrentUserEntry, entry];
      } else if (isFinal && speaker === 'user' && currentTranscriptEntryIdRef.current) {
        // Replace the interim entry with final one
        const withoutInterimEntry = prev.filter(t => t.id !== currentTranscriptEntryIdRef.current);
        currentTranscriptEntryIdRef.current = null;
        return [...withoutInterimEntry, entry];
      } else {
        // AI messages or other final messages
        return [...prev.filter(t => t.isFinal || t.speaker !== speaker), entry];
      }
    });

    // Save to database if final and session exists
    if (isFinal && currentSessionId) {
      addTranscriptMessage(currentSessionId, speaker, message);
    }
  }, [currentSessionId, addTranscriptMessage]);

  // Generate AI question using OpenAI
  const generateNextQuestion = useCallback(async (context: string = ''): Promise<string> => {
    try {
      console.log('🤖 Generating next question with context:', context.substring(0, 100));
      
      const conversationContext = conversationHistoryRef.current.join('\n');
      const prompt = `You are a professional AI interviewer. Based on the conversation so far:
      
${conversationContext}

Latest candidate response: ${context}

Generate the next appropriate interview question. Keep it natural, professional, and relevant to the conversation flow. Avoid repeating previous questions.`;

      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          message: prompt,
          context: 'interview_question_generation'
        }
      });

      if (error) throw error;
      
      const question = data.response || INITIAL_QUESTIONS[questionIndexRef.current] || "Thank you for your responses. Do you have any questions for me?";
      
      // Update conversation history
      conversationHistoryRef.current.push(`AI: ${question}`);
      if (context) {
        conversationHistoryRef.current.push(`Candidate: ${context}`);
      }
      
      return question;
    } catch (error) {
      console.error('🤖 Error generating question:', error);
      // Fallback to predefined questions
      return INITIAL_QUESTIONS[questionIndexRef.current] || "Thank you for your time. Do you have any final thoughts?";
    }
  }, []);

  // Ask question with TTS
  const askQuestion = useCallback(async (question: string) => {
    try {
      setCurrentQuestion(question);
      setInterviewState('questioning');
      addToTranscript('ai', question);
      
      console.log('🤖 Asking question:', question);
      
      await tts.speak(question, {
        voice: 'alloy',
        onPlaybackStart: () => {
          console.log('🔊 AI started speaking');
        },
        onPlaybackEnd: () => {
          console.log('🔊 AI finished speaking, waiting for user response');
          setInterviewState('waiting_response');
          // Start listening for user response
          startUserResponse();
        },
        onPlaybackPause: () => {
          console.log('⏸️ AI speech paused due to user interruption');
          interruptedQuestionRef.current = question;
          setInterviewState('waiting_response');
          startUserResponse();
        }
      });
    } catch (error) {
      console.error('🤖 Error asking question:', error);
      toast({
        title: "Interview Error",
        description: "Failed to ask question. Please check your connection.",
        variant: "destructive",
      });
    }
  }, [tts, addToTranscript, toast]);

  // Handle speech result with 10-second silence detection
  const handleSpeechResult = useCallback((transcript: string, isFinal: boolean) => {
    console.log('🎤 Speech result:', { transcript, isFinal, currentAccumulated: accumulatedSpeechRef.current });
    
    // Set user speaking when we get any transcript
    if (!isUserSpeaking) {
      setIsUserSpeaking(true);
    }
    
    // Smart append - only add new words, not duplicates
    if (transcript.trim()) {
      const currentAccumulated = accumulatedSpeechRef.current.trim();
      const newTranscript = transcript.trim();
      
      if (!currentAccumulated) {
        // First speech, use it as is
        accumulatedSpeechRef.current = newTranscript;
      } else {
        // Check if new transcript is an extension of current accumulated speech
        if (newTranscript.startsWith(currentAccumulated)) {
          // Extract only the new part
          const newPart = newTranscript.substring(currentAccumulated.length).trim();
          if (newPart) {
            accumulatedSpeechRef.current = currentAccumulated + ' ' + newPart;
          }
        } else {
          // If it doesn't start with current accumulated, it might be a completely new phrase
          // This can happen if speech recognition restarted
          accumulatedSpeechRef.current = currentAccumulated + ' ' + newTranscript;
        }
      }
      
      console.log('🎤 Updated accumulated speech:', accumulatedSpeechRef.current);
    }
    
    // Show accumulated speech in transcript as interim
    if (accumulatedSpeechRef.current.trim()) {
      addToTranscript('user', accumulatedSpeechRef.current.trim(), false);
    }
    
    // Reset 10-second silence timer
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    // Start 10-second silence detection
    silenceTimeoutRef.current = setTimeout(() => {
      finalizeUserSpeech();
    }, 10000); // 10 seconds of silence
  }, [isUserSpeaking, addToTranscript]);

  // Finalize user speech after 10 seconds of silence
  const finalizeUserSpeech = useCallback(() => {
    const finalSpeech = accumulatedSpeechRef.current.trim();
    console.log('🎤 Finalizing user speech after 10s silence:', finalSpeech);
    
    if (finalSpeech) {
      // Clear accumulated speech
      accumulatedSpeechRef.current = '';
      
      // Add final transcript entry
      addToTranscript('user', finalSpeech, true);
      
      // Process the complete response
      processUserResponse(finalSpeech);
    }
    
    // Clear silence timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = undefined;
    }
    
    setIsUserSpeaking(false);
  }, [addToTranscript]);

  // Start listening for user response with 10-second silence detection
  const startUserResponse = useCallback(() => {
    console.log('🎤 Starting to listen for user response with 10s silence detection');
    
    // Reset accumulated speech and user speaking state
    accumulatedSpeechRef.current = '';
    currentTranscriptEntryIdRef.current = null;
    setIsUserSpeaking(false);
    
    speechRecognition.startListening({
      continuous: true, // Keep listening continuously
      interimResults: true,
      onResult: handleSpeechResult,
      onError: (error) => {
        console.error('🎤 Speech recognition error:', error);
        setIsUserSpeaking(false);
        
        // Clear accumulated speech on error
        accumulatedSpeechRef.current = '';
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = undefined;
        }
        
        toast({
          title: "Speech Recognition Error",
          description: error,
          variant: "destructive",
        });
        
        // Restart on error if still waiting
        if (interviewState === 'waiting_response') {
          setTimeout(() => startUserResponse(), 1000);
        }
      },
      onStart: () => {
        console.log('🎤 Speech recognition started with continuous mode');
      },
      onEnd: () => {
        console.log('🎤 Speech recognition ended');
        
        // Restart if still waiting and no accumulated speech
        if (interviewState === 'waiting_response' && !accumulatedSpeechRef.current.trim()) {
          setTimeout(() => startUserResponse(), 500);
        }
      }
    });

    // Set overall timeout for user response (backup)
    responseTimeoutRef.current = setTimeout(() => {
      if (accumulatedSpeechRef.current.trim()) {
        finalizeUserSpeech();
      } else {
        // No response detected, ask if they need the question repeated
        askQuestion("I didn't catch that. Would you like me to repeat the question?");
      }
    }, 60000); // 60 second overall timeout
  }, [speechRecognition, handleSpeechResult, finalizeUserSpeech, askQuestion, toast, interviewState]);

  // Process user response and generate next question
  const processUserResponse = useCallback(async (response: string) => {
    if (!response.trim()) return;

    console.log('🎤 Processing user response:', response);
    
    // Clear all timeouts
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = undefined;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = undefined;
    }

    // Stop speech recognition and clear accumulated speech
    speechRecognition.stopListening();
    accumulatedSpeechRef.current = '';
    currentTranscriptEntryIdRef.current = null;
    setIsUserSpeaking(false);
    
    setInterviewState('processing');
    
    // Increment question count
    setQuestionCount(prev => prev + 1);
    questionIndexRef.current++;

    try {
      // Generate next question based on response
      const nextQuestion = await generateNextQuestion(response);
      
      // Small delay for natural conversation flow
      setTimeout(() => {
        askQuestion(nextQuestion);
      }, 1500);
      
    } catch (error) {
      console.error('🤖 Error processing response:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process your response.",
        variant: "destructive",
      });
    }
  }, [speechRecognition, generateNextQuestion, askQuestion, toast]);

  // Cleanup effect for timeouts
  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
    };
  }, []);

  // Main interview flow functions
  const startInterview = useCallback(async (sessionId: string) => {
    try {
      setCurrentSessionId(sessionId);
      setInterviewState('introduction');
      setTranscript([]);
      setQuestionCount(0);
      questionIndexRef.current = 0;
      conversationHistoryRef.current = [];
      setIsUserSpeaking(false);
      
      // Reset all speech accumulation refs
      accumulatedSpeechRef.current = '';
      currentTranscriptEntryIdRef.current = null;
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }

      console.log('🎯 Starting interview with session:', sessionId);
      
      // Ask first question
      const firstQuestion = INITIAL_QUESTIONS[0];
      await askQuestion(firstQuestion);
      
    } catch (error) {
      console.error('🎯 Error starting interview:', error);
      toast({
        title: "Interview Start Error",
        description: "Failed to start the interview.",
        variant: "destructive",
      });
    }
  }, [askQuestion, toast]);

  const endInterview = useCallback(async () => {
    console.log('🏁 Ending interview');
    
    // Stop all audio/recognition
    tts.stop();
    speechRecognition.stopListening();
    setIsUserSpeaking(false);
    
    // Clear all timeouts and accumulated speech
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    accumulatedSpeechRef.current = '';
    currentTranscriptEntryIdRef.current = null;
    
    setInterviewState('completed');
    
    // Thank you message
    addToTranscript('ai', 'Thank you for completing the interview. Your responses have been recorded and will be reviewed.');
    
    // Final TTS
    await tts.speak('Thank you for completing the interview. Your responses have been recorded and will be reviewed.');
  }, [tts, speechRecognition, addToTranscript]);

  const pauseInterview = useCallback(() => {
    tts.pause();
    speechRecognition.stopListening();
    setIsUserSpeaking(false);
    setInterviewState('idle');
  }, [tts, speechRecognition]);

  const resumeInterview = useCallback(() => {
    if (tts.canResume) {
      tts.resume();
    }
    if (interviewState === 'waiting_response') {
      startUserResponse();
    }
  }, [tts, interviewState, startUserResponse]);

  return {
    startInterview,
    endInterview,
    pauseInterview,
    resumeInterview,
    interviewState,
    currentQuestion,
    transcript,
    isAISpeaking: tts.isPlaying,
    isUserSpeaking,
    questionCount
  };
};