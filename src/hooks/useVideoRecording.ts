import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VideoRecordingOptions {
  sessionId: string;
  userId: string;
}

export const useVideoRecording = ({ sessionId, userId }: VideoRecordingOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async (stream: MediaStream) => {
    try {
      console.log('🎥 Starting video recording...');
      
      // Create MediaRecorder with the video stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          console.log(`📦 Recorded chunk: ${event.data.size} bytes`);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('⏹️ Recording stopped, total chunks:', recordedChunksRef.current.length);
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        toast({
          title: "Recording Error",
          description: "Failed to record video",
          variant: "destructive"
        });
      };

      // Start recording with chunks every 10 seconds
      mediaRecorder.start(10000);
      setIsRecording(true);
      console.log('✅ Video recording started');

    } catch (error) {
      console.error('❌ Error starting video recording:', error);
      toast({
        title: "Recording Failed",
        description: "Could not start video recording",
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      console.log('⚠️ No active recording to stop');
      return null;
    }

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;
      
      mediaRecorder.onstop = async () => {
        console.log('⏹️ Recording stopped, processing video...');
        setIsRecording(false);
        setIsUploading(true);

        try {
          // Create blob from recorded chunks
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          console.log(`📹 Video blob created: ${blob.size} bytes`);

          // Upload to Supabase Storage
          const fileName = `${userId}/${sessionId}_${Date.now()}.webm`;
          
          console.log('☁️ Uploading video to storage...');
          const { data, error } = await supabase.storage
            .from('interview-videos')
            .upload(fileName, blob, {
              contentType: 'video/webm',
              upsert: false
            });

          if (error) {
            console.error('❌ Upload error:', error);
            toast({
              title: "Upload Failed",
              description: error.message,
              variant: "destructive"
            });
            resolve(null);
            return;
          }

          console.log('✅ Video uploaded successfully:', data.path);

          // Get the public URL (or signed URL for private bucket)
          const { data: { publicUrl } } = supabase.storage
            .from('interview-videos')
            .getPublicUrl(data.path);

          // Update interview session with video URL
          const { error: updateError } = await supabase
            .from('interview_sessions')
            .update({
              video_url: data.path, // Store the path, not public URL since bucket is private
              recording_duration_seconds: Math.floor(blob.size / 10000) // Rough estimate
            })
            .eq('id', sessionId);

          if (updateError) {
            console.error('❌ Failed to update session with video URL:', updateError);
          } else {
            console.log('✅ Session updated with video URL');
          }

          toast({
            title: "Video Saved",
            description: "Interview recording has been saved successfully",
          });

          resolve(data.path);

        } catch (error) {
          console.error('❌ Error processing video:', error);
          toast({
            title: "Processing Error",
            description: "Failed to process recording",
            variant: "destructive"
          });
          resolve(null);
        } finally {
          setIsUploading(false);
          recordedChunksRef.current = [];
        }
      };

      mediaRecorder.stop();
    });
  }, [sessionId, userId, toast]);

  return {
    isRecording,
    isUploading,
    startRecording,
    stopRecording,
  };
};
