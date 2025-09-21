import { useState, useCallback, useRef } from 'react';

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(async (text: string, voice?: string) => {
    if (!text.trim()) return;

    try {
      setLoading(true);
      
      // Stop any currently playing speech
      if (utteranceRef.current) {
        speechSynthesis.cancel();
        utteranceRef.current = null;
      }

      console.log('🔊 Speaking text:', text.substring(0, 50) + '...');

      // Check if speech synthesis is supported
      if (!('speechSynthesis' in window)) {
        throw new Error('Speech synthesis not supported in this browser');
      }

      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Configure voice settings
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to use a better voice if available
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Microsoft') || 
        v.lang.startsWith('en')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('🔊 Using voice:', preferredVoice.name);
      }

      // Set up event handlers
      utterance.onstart = () => {
        console.log('🔊 Speech started');
        setIsPlaying(true);
      };

      utterance.onend = () => {
        console.log('🔊 Speech ended');
        setIsPlaying(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('🔊 Speech error:', event);
        setIsPlaying(false);
        utteranceRef.current = null;
      };

      // Speak the text
      speechSynthesis.speak(utterance);

      // Wait for speech to start
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Speech synthesis timeout'));
        }, 5000);

        utterance.onstart = () => {
          clearTimeout(timeout);
          setIsPlaying(true);
          resolve(true);
        };

        utterance.onerror = (event) => {
          clearTimeout(timeout);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };
      });

    } catch (error) {
      console.error('🔊 Text-to-speech error:', error);
      setIsPlaying(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (utteranceRef.current) {
      speechSynthesis.cancel();
      utteranceRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    loading
  };
};