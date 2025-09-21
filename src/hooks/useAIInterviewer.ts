import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InterviewMessage {
  id: string;
  speaker: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

interface UseAIInterviewerProps {
  sessionId: string;
  onError?: (error: string) => void;
}

export const useAIInterviewer = ({ sessionId, onError }: UseAIInterviewerProps) => {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const generateAIResponse = useCallback(async (userMessage: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-chat', {
        body: {
          message: userMessage,
          context: messages.slice(-5), // Send last 5 messages for context
          userId: sessionId
        }
      });

      if (error) {
        console.error('AI response error:', error);
        onError?.('Failed to generate AI response');
        return "I appreciate your response. Could you tell me more about that experience?";
      }

      return data.response || "Thank you for sharing. What else would you like to discuss?";
    } catch (error) {
      console.error('Error generating AI response:', error);
      onError?.('Failed to connect to AI service');
      return "That's interesting. Could you elaborate on that point?";
    }
  }, [messages, sessionId, onError]);

  const generateSpeech = useCallback(async (text: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: text,
          voice: 'alloy'
        }
      });

      if (error) {
        console.error('Text-to-speech error:', error);
        onError?.('Failed to generate speech');
        return null;
      }

      return data.audioContent;
    } catch (error) {
      console.error('Error generating speech:', error);
      onError?.('Failed to generate speech');
      return null;
    }
  }, [onError]);

  const addMessage = useCallback((speaker: 'user' | 'ai', message: string) => {
    const newMessage: InterviewMessage = {
      id: Date.now().toString(),
      speaker,
      message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const saveToTranscript = useCallback(async (speaker: 'user' | 'ai', message: string) => {
    try {
      await supabase.functions.invoke('interview-session', {
        body: {
          action: 'add-transcript',
          session_id: sessionId,
          speaker,
          message,
          metadata: {}
        }
      });
    } catch (error) {
      console.error('Error saving to transcript:', error);
      onError?.('Failed to save message to transcript');
    }
  }, [sessionId, onError]);

  const sendMessage = useCallback(async (userInput: string): Promise<InterviewMessage | null> => {
    if (!userInput.trim() || isProcessing) return null;

    setIsProcessing(true);

    try {
      // Add user message
      const userMessage = addMessage('user', userInput.trim());
      await saveToTranscript('user', userMessage.message);

      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage.message);
      const aiMessage = addMessage('ai', aiResponse);
      await saveToTranscript('ai', aiMessage.message);

      return aiMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      onError?.('Failed to process message');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, addMessage, saveToTranscript, generateAIResponse, onError]);

  const speakMessage = useCallback(async (text: string): Promise<void> => {
    setIsSpeaking(true);
    try {
      const audioContent = await generateSpeech(text);
      if (audioContent) {
        // Create and play audio
        const audioBlob = new Blob([
          Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))
        ], { type: 'audio/mpeg' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        return new Promise((resolve) => {
          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          
          audio.onerror = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            onError?.('Failed to play audio');
            resolve();
          };
          
          audio.play().catch(() => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            onError?.('Failed to play audio');
            resolve();
          });
        });
      }
    } catch (error) {
      console.error('Error speaking message:', error);
      onError?.('Failed to speak message');
    } finally {
      setIsSpeaking(false);
    }
  }, [generateSpeech, onError]);

  const initializeInterview = useCallback(async () => {
    const welcomeMessage = addMessage(
      'ai', 
      "Welcome to your AI interview! I'm here to help you practice and improve your interview skills. Let's start with a simple question: Could you please introduce yourself and tell me about your background?"
    );
    
    await saveToTranscript('ai', welcomeMessage.message);
    return welcomeMessage;
  }, [addMessage, saveToTranscript]);

  const resetInterview = useCallback(() => {
    setMessages([]);
    setIsProcessing(false);
    setIsSpeaking(false);
  }, []);

  return {
    messages,
    isProcessing,
    isSpeaking,
    sendMessage,
    speakMessage,
    initializeInterview,
    resetInterview,
    addMessage,
    saveToTranscript
  };
};