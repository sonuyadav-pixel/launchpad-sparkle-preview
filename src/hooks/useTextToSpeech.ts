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

      // Wait for voices to load
      const loadVoices = () => {
        return new Promise<void>((resolve) => {
          const voices = speechSynthesis.getVoices();
          if (voices.length > 0) {
            resolve();
          } else {
            speechSynthesis.addEventListener('voiceschanged', () => resolve(), { once: true });
          }
        });
      };

      await loadVoices();

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
        setLoading(false);
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
        setLoading(false);
      };

      // Speak the text immediately
      speechSynthesis.speak(utterance);
      console.log('🔊 Speech synthesis started');

    } catch (error) {
      console.error('🔊 Text-to-speech error:', error);
      setIsPlaying(false);
      setLoading(false);
      throw error;
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