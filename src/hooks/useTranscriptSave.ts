import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TranscriptMessage {
  speaker: string;
  message: string;
  timestamp: Date;
}

interface TranscriptSaveOptions {
  sessionId: string;
  userId: string;
}

export const useTranscriptSave = ({ sessionId, userId }: TranscriptSaveOptions) => {
  const { toast } = useToast();

  const saveTranscriptToFile = useCallback(async (transcript: TranscriptMessage[]) => {
    try {
      console.log('📝 Saving transcript to file...');

      // Format transcript as text
      const transcriptText = transcript
        .map(msg => {
          const time = new Date(msg.timestamp).toLocaleTimeString();
          return `[${time}] ${msg.speaker.toUpperCase()}: ${msg.message}`;
        })
        .join('\n\n');

      // Create blob
      const blob = new Blob([transcriptText], { type: 'text/plain' });
      const fileName = `${userId}/${sessionId}_transcript_${Date.now()}.txt`;

      console.log('☁️ Uploading transcript to storage...');
      const { data, error } = await supabase.storage
        .from('interview-transcripts')
        .upload(fileName, blob, {
          contentType: 'text/plain',
          upsert: false
        });

      if (error) {
        console.error('❌ Transcript upload error:', error);
        toast({
          title: "Transcript Save Failed",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      console.log('✅ Transcript uploaded successfully:', data.path);

      // Update interview session with transcript file URL
      const { error: updateError } = await supabase
        .from('interview_sessions')
        .update({
          transcript_file_url: data.path
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('❌ Failed to update session with transcript URL:', updateError);
      } else {
        console.log('✅ Session updated with transcript file URL');
      }

      toast({
        title: "Transcript Saved",
        description: "Interview transcript has been saved successfully",
      });

      return data.path;

    } catch (error) {
      console.error('❌ Error saving transcript:', error);
      toast({
        title: "Save Error",
        description: "Failed to save transcript file",
        variant: "destructive"
      });
      return null;
    }
  }, [sessionId, userId, toast]);

  return {
    saveTranscriptToFile,
  };
};
