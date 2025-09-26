import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Upload, X, User, Eye, RotateCcw } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface ProfilePhotoStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onComplete?: () => void;
}

const ProfilePhotoStep: React.FC<ProfilePhotoStepProps> = ({ 
  data, 
  updateData, 
  onNext 
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera access error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCapturedPhoto(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoData);
        
        // Convert to File object
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
            updateData({ profilePhoto: file });
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    updateData({ profilePhoto: undefined });
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    updateData({ profilePhoto: file });
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCapturedPhoto(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
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

  const removePhoto = () => {
    updateData({ profilePhoto: undefined });
    setCapturedPhoto(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Add a profile photo</h2>
        <p className="text-muted-foreground">
          A professional photo helps make a great first impression (Optional)
        </p>
      </div>

      {/* Main Content */}
      {!showCamera && !capturedPhoto && !data.profilePhoto ? (
        /* Upload Options */
        <div className="space-y-4">
          {/* Camera Option */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Take a photo</h3>
                  <p className="text-muted-foreground">Use your camera to take a new photo</p>
                </div>
                <Button onClick={startCamera} className="gap-2">
                  <Camera className="h-4 w-4" />
                  Open Camera
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload Option */}
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
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Upload a photo</h3>
                  <p className="text-muted-foreground">
                    Drop an image here or click to browse
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : showCamera && !capturedPhoto ? (
        /* Camera View */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Take Your Photo
              </span>
              <Button variant="ghost" size="sm" onClick={stopCamera}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-md mx-auto rounded-lg bg-muted"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex justify-center gap-3">
              <Button onClick={capturePhoto} className="gap-2">
                <Camera className="h-4 w-4" />
                Capture Photo
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Photo Preview */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Photo
              </span>
              <Badge variant="secondary" className="gap-1">
                <Eye className="h-3 w-3" />
                Preview
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={capturedPhoto || (data.profilePhoto ? URL.createObjectURL(data.profilePhoto) : '')}
                  alt="Profile"
                  className="w-48 h-48 rounded-full object-cover border-4 border-border"
                />
              </div>
            </div>
            
            <div className="flex justify-center gap-3">
              {showCamera && (
                <Button onClick={retakePhoto} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Retake
                </Button>
              )}
              <Button onClick={removePhoto} variant="outline" className="gap-2">
                <X className="h-4 w-4" />
                Remove Photo
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Different
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Photo Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-1">✅ Good photos have:</h4>
              <ul className="space-y-0.5">
                <li>• Clear, well-lit face</li>
                <li>• Professional appearance</li>
                <li>• Simple background</li>
                <li>• Friendly, confident expression</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">❌ Avoid:</h4>
              <ul className="space-y-0.5">
                <li>• Blurry or dark photos</li>
                <li>• Sunglasses or hats</li>
                <li>• Group photos or selfies</li>
                <li>• Inappropriate backgrounds</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

    </div>
  );
};

export default ProfilePhotoStep;