import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Upload, X, Download, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface ResumeUploadStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onComplete?: () => void;
}

const ResumeUploadStep: React.FC<ResumeUploadStepProps> = ({ 
  data, 
  updateData, 
  onNext 
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Update data with file
    updateData({ resumeFile: file });
    
    // Simulate upload progress
    simulateUpload();
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setIsUploading(false);
          
          // Start parsing simulation
          setTimeout(() => {
            simulateParsing();
          }, 500);
          
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const simulateParsing = () => {
    setIsParsing(true);
    setParseProgress(0);

    const parseInterval = setInterval(() => {
      setParseProgress(prev => {
        if (prev >= 100) {
          clearInterval(parseInterval);
          setIsParsing(false);
          
          toast({
            title: "Resume parsed successfully! ✨",
            description: "AI extracted your information and will help autofill forms.",
          });
          
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    updateData({ resumeFile: undefined });
    setUploadProgress(0);
    setParseProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Upload your resume</h2>
        <p className="text-muted-foreground">
          Let AI parse your resume to automatically fill in your profile details
        </p>
      </div>

      {/* Upload Area */}
      {!data.resumeFile ? (
        <Card
          className={`border-2 border-dashed transition-all cursor-pointer ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Drop your resume here or click to browse
                </h3>
                <p className="text-muted-foreground">
                  Supports PDF and Word documents up to 5MB
                </p>
              </div>

              <Button variant="outline" className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* File Preview */
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium">{data.resumeFile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(data.resumeFile.size)} • {data.resumeFile.type.includes('pdf') ? 'PDF' : 'Word Document'}
                  </p>
                  
                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                  
                  {/* Parse Progress */}
                  {isParsing && (
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          AI is parsing your resume...
                        </span>
                        <span>{parseProgress}%</span>
                      </div>
                      <Progress value={parseProgress} className="h-2" />
                    </div>
                  )}
                  
                  {/* Success State */}
                  {!isUploading && !isParsing && uploadProgress === 100 && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                      <CheckCircle className="h-4 w-4" />
                      <span>Resume uploaded and parsed successfully</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Enhancement Info */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">AI-Powered Resume Parsing</h3>
              <p className="text-sm text-muted-foreground">
                Our AI will automatically extract your experience, education, skills, and achievements to populate your profile. 
                You can always review and edit the information before finalizing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Tips for Better Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">✅ Best Practices</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use a standard resume format</li>
                <li>• Include clear section headers</li>
                <li>• List skills and technologies used</li>
                <li>• Include quantifiable achievements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚠️ Avoid</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Heavily formatted or creative layouts</li>
                <li>• Images or graphics as text</li>
                <li>• Scanned documents (low quality)</li>
                <li>• Password-protected files</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileInputChange}
        className="hidden"
      />

    </div>
  );
};

export default ResumeUploadStep;