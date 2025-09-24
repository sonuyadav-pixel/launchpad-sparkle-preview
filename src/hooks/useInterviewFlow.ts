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

  // Initialize hooks
  const tts = useAdvancedTTS();
  const { addTranscriptMessage } = useInterviewSession();
  
  // Speech recognition without VAD
  const speechRecognition = useSpeechRecognition();

  // Add transcript entry helper
  const addToTranscript = useCallback((speaker: 'ai' | 'user', message: string, isFinal: boolean = true) => {
    const entry: TranscriptEntry = {
      id: `${Date.now()}-${Math.random()}`,
      speaker,
      message,
      timestamp: new Date(),
      isFinal
    };

    setTranscript(prev => {
      if (!isFinal) {
        // Replace last interim entry or add new one
        const withoutLastInterim = prev.filter(t => t.isFinal || t.speaker !== speaker);
        return [...withoutLastInterim, entry];
      }
      return [...prev.filter(t => t.isFinal), entry];
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

  // Start listening for user response
  const startUserResponse = useCallback(() => {
    userResponseBufferRef.current = '';
    setIsUserSpeaking(true);
    
    speechRecognition.startListening({
      continuous: true,
      interimResults: true,
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          userResponseBufferRef.current += ' ' + transcript;
          addToTranscript('user', transcript.trim(), true);
        } else {
          addToTranscript('user', transcript.trim(), false);
        }
      },
      onError: (error) => {
        console.error('🎤 Speech recognition error:', error);
        setIsUserSpeaking(false);
        toast({
          title: "Speech Recognition Error",
          description: error,
          variant: "destructive",
        });
        setIsUserSpeaking(false);
      }
    });

    // Set timeout for user response
    responseTimeoutRef.current = setTimeout(() => {
      if (userResponseBufferRef.current.trim()) {
        processUserResponse(userResponseBufferRef.current.trim());
      } else {
        // No response detected, ask if they need the question repeated
        askQuestion("I didn't catch that. Would you like me to repeat the question?");
      }
    }, 30000); // 30 second timeout
  }, [speechRecognition, addToTranscript, askQuestion, toast]);

  // Process user response and generate next question
  const processUserResponse = useCallback(async (response: string) => {
    if (!response.trim()) return;

    console.log('🎤 Processing user response:', response);
    
    // Clear timeout
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = undefined;
    }

    // Stop speech recognition
    speechRecognition.stopListening();
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

  // Handle user speech state changes with simple timeout
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (!isUserSpeaking && userResponseBufferRef.current.trim() && interviewState === 'waiting_response') {
      // User stopped speaking, process their response after a delay
      timeout = setTimeout(() => {
        processUserResponse(userResponseBufferRef.current.trim());
      }, 2000); // 2 second delay after stopping speech
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isUserSpeaking, interviewState, processUserResponse]);

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
    
    // Clear timeouts
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
    
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