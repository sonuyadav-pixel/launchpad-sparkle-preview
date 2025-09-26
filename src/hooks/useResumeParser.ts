import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ParsedResumeData {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  parsed_data: any;
  created_at: string;
}

export const useResumeParser = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parseProgress, setParseProgress] = useState(0);
  const { toast } = useToast();

  const uploadAndParseResume = async (file: File): Promise<ParsedResumeData | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(100);
      setIsUploading(false);
      setIsParsing(true);
      setParseProgress(0);

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get file URL');
      }

      // Simulate parsing progress
      const progressInterval = setInterval(() => {
        setParseProgress(prev => {
          const newProgress = prev + 20;
          if (newProgress >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return newProgress;
        });
      }, 300);

      // Call the parse-resume edge function
      const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-resume', {
        body: {
          fileUrl: urlData.publicUrl,
          fileName: file.name,
          filePath: filePath
        }
      });

      clearInterval(progressInterval);
      setParseProgress(100);

      if (parseError) {
        throw new Error(`Parse failed: ${parseError.message}`);
      }

      if (!parseResult.success) {
        throw new Error(parseResult.error || 'Failed to parse resume');
      }

      setIsParsing(false);
      
      toast({
        title: "Resume parsed successfully! ✨",
        description: "AI extracted your information and will help autofill forms."
      });

      return parseResult.data;

    } catch (error) {
      setIsUploading(false);
      setIsParsing(false);
      setUploadProgress(0);
      setParseProgress(0);
      
      console.error('Resume upload/parse error:', error);
      toast({
        title: "Error processing resume",
        description: error instanceof Error ? error.message : "Failed to process resume",
        variant: "destructive"
      });
      
      return null;
    }
  };

  const reset = () => {
    setIsUploading(false);
    setIsParsing(false);
    setUploadProgress(0);
    setParseProgress(0);
  };

  return {
    uploadAndParseResume,
    isUploading,
    isParsing,
    uploadProgress,
    parseProgress,
    reset
  };
};