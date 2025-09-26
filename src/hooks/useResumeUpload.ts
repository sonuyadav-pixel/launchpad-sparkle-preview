import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ParsedResumeData {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  parsed_data: any;
  created_at: string;
  updated_at: string;
}

export const useResumeUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadAndParseResume = async (file: File): Promise<ParsedResumeData | null> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      setUploadProgress(20);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      setUploadProgress(50);

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      setUploadProgress(70);

      // Call parse-resume edge function
      const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-resume', {
        body: {
          fileUrl: publicUrl,
          fileName: file.name,
          filePath: filePath
        }
      });

      if (parseError) {
        console.error('Parse error:', parseError);
        throw new Error(`Failed to parse resume: ${parseError.message}`);
      }

      if (!parseResult.success) {
        throw new Error(parseResult.error || 'Failed to parse resume');
      }

      setUploadProgress(100);

      toast({
        title: "Resume uploaded successfully!",
        description: "Your resume has been parsed and saved.",
      });

      return parseResult.data;

    } catch (error) {
      console.error('Resume upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload and parse resume",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getParsedResumes = async (): Promise<ParsedResumeData[]> => {
    try {
      const { data, error } = await supabase
        .from('parsed_resumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching parsed resumes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching parsed resumes:', error);
      return [];
    }
  };

  return {
    uploadAndParseResume,
    getParsedResumes,
    isUploading,
    uploadProgress
  };
};