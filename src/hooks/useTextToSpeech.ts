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
      
      console.log('🔊 Audio blob created:', {
        size: audioBlob.size,
        type: audioBlob.type,
        url: audioUrl
      });
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Set volume to maximum to ensure it's audible
      audio.volume = 1.0;
      
      console.log('🔊 Audio element created:', {
        volume: audio.volume,
        muted: audio.muted,
        readyState: audio.readyState
      });
      
      audio.onloadstart = () => {
        console.log('🔊 Audio loading started');
        setIsPlaying(true);
      };
      
      audio.oncanplay = () => {
        console.log('🔊 Audio can play - browser can start playing');
      };
      
      audio.onplay = () => {
        console.log('🔊 Audio playback STARTED successfully');
        setIsPlaying(true);
      };
      
      audio.onended = () => {
        console.log('🔊 Audio playback ENDED');
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      audio.onerror = (e) => {
        console.error('🔊 Audio playback ERROR:', e);
        console.error('🔊 Audio error details:', {
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState
        });
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      // Check if user interaction is required for autoplay
      console.log('🔊 Attempting to play audio...');
      try {
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          console.log('🔊 Audio play() promise resolved successfully');
        }
      } catch (playError) {
        console.error('🔊 Audio play() failed:', playError);
        
        // If autoplay failed, try to enable audio on user interaction
        if (playError.name === 'NotAllowedError') {
          console.log('🔊 Autoplay blocked - audio requires user interaction');
          
          // Try playing with user gesture simulation
          document.addEventListener('click', () => {
            audio.play().catch(e => console.error('🔊 Manual play failed:', e));
          }, { once: true });
          
          // Show a notification that user needs to click
          console.log('🔊 Please click anywhere on the page to enable audio');
        }
        
        throw playError;
      }

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