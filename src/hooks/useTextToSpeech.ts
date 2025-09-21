import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, voice?: string) => {
    if (!text.trim()) return;

    try {
      setLoading(true);
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      console.log('Converting text to speech:', text.substring(0, 50) + '...');

      // Call our edge function
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text.trim(), 
          voice: voice || 'alloy' // Default voice
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to convert text to speech');
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Convert base64 to audio blob
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onloadstart = () => {
        console.log('Audio loading started');
        setIsPlaying(true);
      };
      
      audio.onplay = () => {
        console.log('Audio playback started');
        setIsPlaying(true);
      };
      
      audio.onended = () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();

    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsPlaying(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
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