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
        console.warn('🔊 ElevenLabs TTS error (continuing without audio):', error);
        setLoading(false);
        setIsPlaying(false);
        return; // Gracefully skip audio - don't throw
      }

      if (!data?.audioContent) {
        console.warn('🔊 No audio content received (continuing without audio)');
        setLoading(false);
        setIsPlaying(false);
        return; // Gracefully skip audio - don't throw
      }

      console.log('🔊 Audio content received, length:', data.audioContent.length);

      // Convert base64 to audio and play it
      try {
        const audioData = atob(data.audioContent);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }

        const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        console.log('🔊 Audio blob created, size:', audioBlob.size);

        setLoading(false);
        setIsPlaying(true);

        // Set up audio event handlers
        audio.onloadeddata = () => {
          console.log('🔊 Audio data loaded successfully');
        };

        audio.oncanplay = () => {
          console.log('🔊 Audio ready to play');
        };

        audio.onended = () => {
          console.log('🔊 ElevenLabs audio playback finished');
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = (error) => {
          console.warn('🔊 Audio playback error (continuing):', error);
          setIsPlaying(false);
          setLoading(false);
          URL.revokeObjectURL(audioUrl);
        };

        // Play the audio
        await audio.play();
        console.log('🔊 Playing ElevenLabs audio');

      } catch (audioError) {
        console.warn('🔊 Audio processing error (continuing without audio):', audioError);
        setLoading(false);
        setIsPlaying(false);
        // Don't throw - just continue without audio
      }

    } catch (error) {
      console.warn('🔊 ElevenLabs TTS error (continuing without audio):', error);
      setIsPlaying(false);
      setLoading(false);
      // Never throw - always continue the interview
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