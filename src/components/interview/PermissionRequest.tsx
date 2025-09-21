import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Camera, 
  Mic, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from "lucide-react";

interface PermissionRequestProps {
  onPermissionGranted: () => void;
  onPermissionDenied: (error: string) => void;
}

const PermissionRequest = ({ onPermissionGranted, onPermissionDenied }: PermissionRequestProps) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const requestPermissions = async () => {
    setIsRequesting(true);
    
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera and microphone access. Please use a modern browser like Chrome, Firefox, or Safari.');
      }

      // Request permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Stop the stream immediately - we just needed to request permission
      stream.getTracks().forEach(track => track.stop());
      
      onPermissionGranted();
    } catch (error: any) {
      console.error('Permission request failed:', error);
      
      let errorMessage = 'Failed to access camera and microphone.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera and microphone access was denied. Please allow access and try again.';
        setShowInstructions(true);
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone was found. Please connect a camera and microphone.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Your browser does not support camera and microphone access.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Camera and microphone access is blocked by your browser security settings.';
        setShowInstructions(true);
      }
      
      onPermissionDenied(errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Permission Required</h1>
        <p className="text-muted-foreground mb-6">
          To start your AI interview, we need access to your camera and microphone.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Camera className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium text-sm">Camera Access</p>
              <p className="text-xs text-muted-foreground">For video interview simulation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Mic className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium text-sm">Microphone Access</p>
              <p className="text-xs text-muted-foreground">For speech recognition and interaction</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg mb-6">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Privacy Protected</p>
              <p className="text-xs text-blue-700 dark:text-blue-200">
                Your video and audio are processed locally in your browser. Nothing is recorded or stored on our servers.
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={requestPermissions} 
          disabled={isRequesting}
          className="w-full"
          size="lg"
        >
          {isRequesting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Requesting Access...
            </>
          ) : (
            'Allow Camera & Microphone'
          )}
        </Button>

        {showInstructions && (
          <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Permission Blocked?
                </p>
                <div className="text-xs text-orange-700 dark:text-orange-200 space-y-1">
                  <p>1. Look for a camera/microphone icon in your browser's address bar</p>
                  <p>2. Click it and select "Allow"</p>
                  <p>3. Refresh the page if needed</p>
                  <p>4. Make sure your camera and microphone are not being used by other apps</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PermissionRequest;