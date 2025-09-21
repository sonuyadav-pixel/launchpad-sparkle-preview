import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useElevenLabsTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const speak = useCallback(async (text: string, voice: string = 'alloy') => {
    if (!text.trim()) return;

    try {
      setLoading(true);
      console.log('🔊 Using ElevenLabs TTS for:', text.substring(0, 50) + '...');

      // Call our Supabase edge function for text-to-speech
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) {
        console.error('🔊 ElevenLabs TTS error:', error);
        throw error;
      }

      if (!data.audioContent) {
        throw new Error('No audio content received from ElevenLabs');
      }

      // Convert base64 to audio and play it
      const audioData = atob(data.audioContent);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }

      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      setIsPlaying(true);
      setLoading(false);

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        console.log('🔊 ElevenLabs audio playback finished');
      };

      audio.onerror = (error) => {
        console.error('🔊 Audio playback error:', error);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      console.log('🔊 Playing ElevenLabs audio');

    } catch (error) {
      console.error('🔊 ElevenLabs TTS error:', error);
      setIsPlaying(false);
      setLoading(false);
      throw error;
    }
  }, []);

  const stop = useCallback(() => {
    // Note: There's no direct way to stop audio playback with this approach
    // The audio will complete naturally
    setIsPlaying(false);
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    loading
  };
};