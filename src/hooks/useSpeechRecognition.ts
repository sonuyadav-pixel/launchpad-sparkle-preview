import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

interface SpeechRecognitionResult {
  transcript: string;
  isListening: boolean;
  startListening: (options?: SpeechRecognitionOptions) => void;
  stopListening: () => void;
  isSupported: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechRecognition = (): SpeechRecognitionResult => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const optionsRef = useRef<SpeechRecognitionOptions>({});
  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const processTranscript = useCallback((text: string, isFinal: boolean) => {
    console.log('🎤 Processing transcript:', { text, isFinal, length: text.length });
    
    // Simplified filtering - less aggressive
    const filteredText = text.trim();
    
    if (filteredText && filteredText.length > 0) {
      console.log('🎤 Setting transcript:', filteredText);
      setTranscript(prev => isFinal ? prev + ' ' + filteredText : filteredText);
      optionsRef.current.onResult?.(filteredText, isFinal);
    } else {
      console.log('🎤 Transcript filtered out or empty');
    }
  }, []);

  const startListening = useCallback((options: SpeechRecognitionOptions = {}) => {
    if (!isSupported) {
      console.error('Speech recognition not supported');
      options.onError?.('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      console.log('🎤 Speech recognition already running');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Store options
      optionsRef.current = options;

      // Configure recognition
      recognition.continuous = options.continuous ?? true;
      recognition.interimResults = options.interimResults ?? true;
      recognition.lang = options.language || 'en-US';
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        options.onStart?.();
        console.log('🎤 Speech recognition started');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Process final results
        if (finalTranscript) {
          console.log('🎤 Final transcript:', finalTranscript);
          processTranscript(finalTranscript.trim(), true);
        }

        // Process interim results
        if (interimTranscript && options.interimResults) {
          console.log('🎤 Interim transcript:', interimTranscript);
          processTranscript(interimTranscript.trim(), false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('🎤 Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition error';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied';
            break;
          case 'network':
            errorMessage = 'Network error occurred';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        options.onError?.(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
        options.onEnd?.();
        console.log('🎤 Speech recognition ended');
        
        // Don't auto-restart - let the parent component handle restart logic
      };

      // Start recognition
      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (error) {
      console.error('🎤 Error starting speech recognition:', error);
      setIsListening(false);
      options.onError?.('Failed to start speech recognition');
    }
  }, [isSupported, isListening, processTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      console.log('🎤 Speech recognition stopped manually');
    }
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSupported
  };
};