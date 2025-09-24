import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

const VideoInterface = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleCamera = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleMicrophone = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/50">
      <div className="aspect-video relative">
        {isVideoEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center rounded-lg">
            <VideoOff className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        
        {/* Overlay with user info */}
        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2">
          <span className="text-sm font-medium text-foreground">You</span>
        </div>

        {/* Camera/Mic status indicators */}
        <div className="absolute top-4 right-4 flex gap-2">
          {!isCameraOn && (
            <div className="bg-destructive/80 backdrop-blur-sm rounded-full p-2">
              <CameraOff className="w-4 h-4 text-destructive-foreground" />
            </div>
          )}
          {!isMicOn && (
            <div className="bg-destructive/80 backdrop-blur-sm rounded-full p-2">
              <MicOff className="w-4 h-4 text-destructive-foreground" />
            </div>
          )}
        </div>

        {/* Controls overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <Button
            variant={isCameraOn ? "secondary" : "destructive"}
            size="sm"
            onClick={toggleCamera}
            className="rounded-full w-10 h-10 p-0"
          >
            {isCameraOn ? (
              <Camera className="w-4 h-4" />
            ) : (
              <CameraOff className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            variant={isMicOn ? "secondary" : "destructive"}
            size="sm"
            onClick={toggleMicrophone}
            className="rounded-full w-10 h-10 p-0"
          >
            {isMicOn ? (
              <Mic className="w-4 h-4" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            variant={isVideoEnabled ? "secondary" : "outline"}
            size="sm"
            onClick={toggleVideo}
            className="rounded-full w-10 h-10 p-0"
          >
            {isVideoEnabled ? (
              <Video className="w-4 h-4" />
            ) : (
              <VideoOff className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VideoInterface;