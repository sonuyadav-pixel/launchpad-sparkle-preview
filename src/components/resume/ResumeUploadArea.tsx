import { useCallback, useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useResumeUpload } from '@/hooks/useResumeUpload';

interface ResumeUploadAreaProps {
  onUploadComplete: (parsedData: any) => void;
}

export const ResumeUploadArea = ({ onUploadComplete }: ResumeUploadAreaProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { uploadAndParseResume, isUploading, uploadProgress } = useResumeUpload();

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      alert('Please select a PDF or Word document');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const result = await uploadAndParseResume(file);
    if (result) {
      onUploadComplete(result);
    }
  }, [uploadAndParseResume, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  if (isUploading) {
    return (
      <div className="text-center p-12 space-y-6">
        <div className="relative">
          <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <FileText className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Processing your resume...</h3>
          <p className="text-muted-foreground">
            {uploadProgress < 50 ? 'Uploading file...' : 
             uploadProgress < 80 ? 'Parsing content...' : 
             'Almost done...'}
          </p>
          <div className="max-w-md mx-auto">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">{uploadProgress}% complete</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
        isDragOver 
          ? 'border-primary bg-primary/10 scale-105' 
          : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id="resume-upload"
      />
      
      <div className="space-y-6">
        <div className="relative mx-auto w-20 h-20">
          <div className={`w-full h-full rounded-full border-4 border-dashed flex items-center justify-center transition-all duration-300 ${
            isDragOver ? 'border-primary bg-primary/20' : 'border-muted-foreground/30'
          }`}>
            <Upload className={`h-8 w-8 transition-colors duration-300 ${
              isDragOver ? 'text-primary' : 'text-muted-foreground'
            }`} />
          </div>
          {isDragOver && (
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            {isDragOver ? 'Drop your resume here' : 'Upload your resume'}
          </h3>
          <p className="text-muted-foreground">
            Drag and drop your resume file here, or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Supports PDF, DOC, DOCX (max 10MB)
          </p>
        </div>

        <Button 
          variant="outline" 
          size="lg"
          onClick={() => document.getElementById('resume-upload')?.click()}
          className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
        >
          <FileText className="mr-2 h-5 w-5" />
          Choose File
        </Button>
      </div>
    </div>
  );
};