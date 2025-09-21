import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Download,
  Timer,
  Circle,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import PermissionRequest from "@/components/interview/PermissionRequest";

interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

const Interview = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [hasVideoPermission, setHasVideoPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showPermissionRequest, setShowPermissionRequest] = useState(true);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([
    {
      id: '1',
      speaker: 'ai',
      message: 'Hello! Welcome to your AI interview. I\'m here to help you practice and improve your interview skills. Let\'s begin with a simple question: Can you tell me about yourself?',
      timestamp: new Date()
    }
  ]);

  const transcriptRef = useRef<HTMLDivElement>(null);

  // Initialize camera and microphone - simplified and fast
  const initializeMedia = async (attempt = 1) => {
    const maxRetries = 3;
    setIsVideoLoading(true);
    
    try {
      console.log(`Getting media stream (attempt ${attempt})`);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: true
      });
      
      console.log('Stream obtained:', stream.active);
      
      // Immediately set stream and update states
      streamRef.current = stream;
      setHasVideoPermission(true);
      setPermissionError(null);
      setRetryCount(0);
      
      // Set video source immediately
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Force immediate play
        videoRef.current.play().then(() => {
          console.log('Video playing immediately');
          setIsVideoLoading(false);
        }).catch(err => {
          console.log('Immediate play failed, will auto-play:', err);
          setIsVideoLoading(false);
        });
      } else {
        setIsVideoLoading(false);
      }
      
      // Initialize speech recognition
      initializeSpeechRecognition();
      
    } catch (error) {
      console.error(`Media access failed (attempt ${attempt}):`, error);
      setIsVideoLoading(false);
      
      if (attempt < maxRetries) {
        setRetryCount(attempt);
        setTimeout(() => initializeMedia(attempt + 1), 1000);
      } else {
        setPermissionError(`Camera access failed: ${error.message}`);
        setHasVideoPermission(false);
        setRetryCount(0);
      }
    }
  };

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };
      
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        // Restart recognition if not muted
        if (!isMuted && hasVideoPermission) {
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 100);
        }
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript.trim()) {
          console.log('Speech recognized:', finalTranscript);
          addTranscriptMessage('user', finalTranscript.trim());
          
          // Simulate AI response after a delay
          setTimeout(() => {
            simulateAIResponse(finalTranscript.trim());
          }, 1000);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
      
      // Start recognition
      recognitionRef.current.start();
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  };

  // Add transcript message function
  const addTranscriptMessage = (speaker: 'user' | 'ai', message: string) => {
    const newMessage: TranscriptMessage = {
      id: Date.now().toString(),
      speaker,
      message,
      timestamp: new Date()
    };
    setTranscript(prev => [...prev, newMessage]);
  };

  // Simulate AI response
  const simulateAIResponse = (userMessage: string) => {
    const responses = [
      "That's interesting. Can you elaborate on that?",
      "Great point! Tell me more about your experience with that.",
      "How did that make you feel?",
      "What would you do differently next time?",
      "Can you give me a specific example?",
      "What challenges did you face in that situation?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addTranscriptMessage('ai', randomResponse);
  };

  // Check if permissions are already granted
  const checkExistingPermissions = async () => {
    try {
      // Try to get media without showing permission dialog
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true
      });
      
      // If we get here, permissions are already granted
      console.log('Permissions already granted');
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      setShowPermissionRequest(false);
      initializeMedia();
    } catch (error: any) {
      console.log('Permissions not granted yet:', error.name);
      // If we get here, we need to request permissions
      setShowPermissionRequest(true);
    }
  };

  // Start media only after permission is granted
  useEffect(() => {
    // Check existing permissions first
    checkExistingPermissions();
    
    return () => {
      // Cleanup: stop all tracks and recognition when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle camera toggle - with proper restart
  const toggleCamera = async () => {
    if (streamRef.current && videoRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const willBeEnabled = !videoTrack.enabled;
        videoTrack.enabled = willBeEnabled;
        setIsCameraOn(willBeEnabled);
        
        if (willBeEnabled) {
          console.log('Camera enabled, restarting video...');
          setIsVideoLoading(true);
          
          // Force video to restart
          try {
            // Reset video element
            videoRef.current.load();
            
            // Wait a moment for the load to process
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Try to play
            await videoRef.current.play();
            console.log('Video restarted successfully');
            setIsVideoLoading(false);
          } catch (error) {
            console.error('Failed to restart video:', error);
            
            // Fallback: recreate the stream
            try {
              const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: true
              });
              
              // Stop old stream
              streamRef.current.getTracks().forEach(track => track.stop());
              
              // Set new stream
              streamRef.current = newStream;
              videoRef.current.srcObject = newStream;
              await videoRef.current.play();
              
              console.log('Video restarted with new stream');
              setIsVideoLoading(false);
            } catch (restartError) {
              console.error('Complete restart failed:', restartError);
              setIsVideoLoading(false);
            }
          }
        }
      }
    }
  };

  // Handle microphone toggle
  const toggleMicrophone = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        // Control speech recognition based on mute state
        if (recognitionRef.current) {
          if (!audioTrack.enabled) {
            recognitionRef.current.stop();
          } else {
            recognitionRef.current.start();
          }
        }
      }
    }
  };

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setInterviewDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  // Simulate AI speaking animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAiSpeaking(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndInterview = () => {
    // Stop all media tracks and speech recognition before leaving
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    navigate('/dashboard');
  };

  const handlePermissionGranted = () => {
    setShowPermissionRequest(false);
    initializeMedia();
  };

  const handlePermissionDenied = (error: string) => {
    setPermissionError(error);
    setHasVideoPermission(false);
    setShowPermissionRequest(false);
  };

  if (showPermissionRequest) {

  return (
      <PermissionRequest 
        onPermissionGranted={handlePermissionGranted}
        onPermissionDenied={handlePermissionDenied}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background border-b">
        <div className="flex items-center gap-3">
          <Circle className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">AI Interview</span>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleEndInterview}
          className="hover:bg-destructive/90"
        >
          <Phone className="h-4 w-4 mr-2" />
          End Interview
        </Button>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-4 px-4 h-screen flex flex-col">
        <div className="flex-1 flex flex-col gap-4 max-w-7xl mx-auto w-full">
          {/* Top Section - Video Panels - Fixed Height */}
          <div className="grid grid-cols-2 gap-4 h-80 flex-shrink-0">
            {/* Candidate Video Panel */}
            <Card className="relative overflow-hidden bg-muted h-full">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 relative">
                {hasVideoPermission && isCameraOn ? (
                  <>
                    {isVideoLoading && (
                      <div className="absolute inset-0 bg-muted/80 flex items-center justify-center z-10">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ 
                        transform: 'scaleX(-1)',
                        borderRadius: '0.5rem'
                      }}
                      onLoadedMetadata={() => {
                        console.log('Video ready');
                        setIsVideoLoading(false);
                      }}
                      onPlay={() => {
                        console.log('Video playing');
                        setIsVideoLoading(false);
                      }}
                      onError={(e) => {
                        console.error('Video error:', e);
                        setIsVideoLoading(false);
                      }}
                    />
                  </>
                ) : permissionError ? (
                  <div className="text-center p-4">
                    <VideoOff className="h-12 w-12 text-destructive mx-auto mb-2" />
                    <p className="text-destructive text-sm mb-2">Camera Access Required</p>
                    <p className="text-muted-foreground text-xs">{permissionError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => initializeMedia()}
                    >
                      Retry Access
                    </Button>
                  </div>
                ) : !isCameraOn ? (
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border-4 border-primary/30">
                      <User className="h-16 w-16 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Camera is off</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Loading camera...</p>
                  </div>
                )}
                
                {/* Timer */}
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm">{formatTime(interviewDuration)}</span>
                </div>

                {/* Controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant={isMuted ? "destructive" : "secondary"}
                    onClick={toggleMicrophone}
                    className={cn(
                      "backdrop-blur-sm transition-all duration-200",
                      isMuted 
                        ? "bg-destructive/90 hover:bg-destructive text-destructive-foreground" 
                        : "bg-background/80 hover:bg-background/90"
                    )}
                    disabled={!hasVideoPermission}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant={!isCameraOn ? "destructive" : "secondary"}
                    onClick={toggleCamera}
                    className={cn(
                      "backdrop-blur-sm transition-all duration-200",
                      !isCameraOn 
                        ? "bg-destructive/90 hover:bg-destructive text-destructive-foreground" 
                        : "bg-background/80 hover:bg-background/90"
                    )}
                    disabled={!hasVideoPermission}
                  >
                    {!isCameraOn ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Connection & Audio Status Indicator */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {/* Connection Status */}
                  <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      hasVideoPermission ? "bg-green-500 animate-pulse" : "bg-red-500"
                    )}></div>
                    <span className="text-sm text-muted-foreground">
                      {hasVideoPermission ? "Connected" : "No Access"}
                    </span>
                  </div>
                  
                  {/* Audio Status */}
                  {hasVideoPermission && (
                    <div className={cn(
                      "flex items-center gap-2 backdrop-blur-sm rounded-lg px-3 py-1",
                      isMuted ? "bg-destructive/90" : "bg-green-500/90"
                    )}>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isMuted ? "bg-white" : "bg-white animate-pulse"
                      )}></div>
                      <span className="text-sm text-white font-medium">
                        {isMuted ? "Muted" : "Listening"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* AI Bot Video Panel */}
            <Card className="relative overflow-hidden bg-muted h-full">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="text-center">
                  <div className={cn(
                    "w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 transition-all duration-500",
                    isAiSpeaking ? "ring-4 ring-primary/30 scale-105" : "scale-100"
                  )}>
                    <span className="text-3xl font-bold text-white">AI</span>
                  </div>
                  <p className="text-muted-foreground mb-2">AI Interviewer</p>
                  {isAiSpeaking && (
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                </div>
                
                {/* AI Connection Indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">AI Connected</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom Section - Transcript & Tabs - Flexible Height */}
          <Card className="flex flex-col flex-1 min-h-0">
            <Tabs defaultValue="transcript" className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <TabsList className="grid w-auto grid-cols-3">
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="coming-soon">Coming Soon</TabsTrigger>
                </TabsList>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              <TabsContent value="transcript" className="px-6 pb-6 h-64">
                <ScrollArea className="h-full">
                  <div className="space-y-4 pr-4 pb-4">
                    {transcript.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.speaker === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg px-4 py-2",
                            message.speaker === 'user'
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium opacity-70">
                              {message.speaker === 'user' ? 'You' : 'AI Interviewer'}
                            </span>
                            <span className="text-xs opacity-50">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="summary" className="flex-1 px-6 pb-6 min-h-0">
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Circle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Interview Summary</h3>
                    <p className="text-muted-foreground">
                      Key points and insights will appear here after the interview is completed.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="coming-soon" className="flex-1 px-6 pb-6 min-h-0">
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Circle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground">
                      New features like real-time analytics and detailed feedback are coming soon. Stay tuned!
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Interview;