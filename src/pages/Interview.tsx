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
  User,
  ArrowLeft
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import PermissionRequest from "@/components/interview/PermissionRequest";
import { useInterviewSession, type TranscriptMessage } from "@/hooks/useInterviewSession";
import { Logo } from "@/components/ui/Logo";
import { sessionManager } from "@/utils/SessionManager";

const Interview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const {
    currentSession,
    transcripts,
    loading: sessionLoading,
    error: sessionError,
    setError: setSessionError,
    createSession,
    joinSession,
    updateSession,
    addTranscriptMessage: saveTranscriptToDatabase,
    getTranscript,
    setTranscripts
  } = useInterviewSession();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  
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

  // Initialize session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      if (sessionId) {
        // Join existing session
        try {
          await joinSession(sessionId);
          console.log('Joined existing session:', sessionId);
        } catch (error) {
          console.error('Failed to join session:', error);
          setSessionError("Failed to join interview session. Starting new session.");
          // Create new session if joining fails
          await createSession({
            title: `Interview Session - ${new Date().toLocaleDateString()}`,
            interview_type: 'general'
          });
        }
      } else {
        // Create new session
        try {
          await createSession({
            title: `Interview Session - ${new Date().toLocaleDateString()}`,
            interview_type: 'general'
          });
          console.log('Created new session');
        } catch (error) {
          console.error('Failed to create session:', error);
          setSessionError("Failed to create interview session.");
        }
      }
    };

    initializeSession();
  }, [sessionId, joinSession, createSession, setSessionError]);

  // Convert server transcripts to local format and sync
  useEffect(() => {
    if (transcripts.length > 0) {
      const convertedTranscripts = transcripts.map(t => ({
        id: t.id,
        speaker: t.speaker as 'user' | 'ai',
        message: t.message,
        timestamp: new Date(t.timestamp)
      }));
      // Only update if transcripts are different to avoid loops
      setLocalTranscript(convertedTranscripts);
    }
  }, [transcripts]);

  // Local transcript state for UI
  const [localTranscript, setLocalTranscript] = useState<any[]>([
    {
      id: '1',
      speaker: 'ai',
      message: 'Hello! Welcome to your AI interview. I\'m here to help you practice and improve your interview skills. Let\'s begin with a simple question: Can you tell me about yourself?',
      timestamp: new Date()
    }
  ]);

  // Robust media initialization that works in all cases
  const initializeMedia = async () => {
    try {
      console.log('Initializing media...');
      setIsVideoLoading(true);
      
      // Stop any existing streams first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Get new stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: true
      });
      
      console.log('New stream obtained:', stream.id);
      streamRef.current = stream;
      setHasVideoPermission(true);
      setPermissionError(null);
      setIsCameraOn(true);
      
      // Setup video element
      await setupVideo(stream);
      
      // Store session in session manager
      sessionManager.setActiveSession(
        currentSession?.id || 'temp', 
        stream, 
        recognitionRef.current,
        currentSession?.title || 'AI Interview Session'
      );
      
      // Initialize speech recognition
      initializeSpeechRecognition();
      
    } catch (error) {
      console.error('Media initialization failed:', error);
      setPermissionError(`Camera access failed: ${error.message}`);
      setHasVideoPermission(false);
      setIsVideoLoading(false);
    }
  };

  // Separate video setup function
  const setupVideo = async (stream: MediaStream) => {
    console.log('setupVideo called with stream:', stream.id, 'video tracks:', stream.getVideoTracks().length);
    
    if (!videoRef.current) {
      console.error('Video element not available - videoRef.current is null');
      setIsVideoLoading(false);
      return;
    }

    try {
      console.log('Setting up video with stream:', stream.id);
      
      // Clear existing source
      videoRef.current.srcObject = null;
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Set new source
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready and play
      await new Promise((resolve, reject) => {
        const video = videoRef.current!;
        
        const cleanup = () => {
          video.removeEventListener('loadedmetadata', onLoaded);
          video.removeEventListener('error', onError);
        };
        
        const onLoaded = async () => {
          try {
            await video.play();
            console.log('Video playing successfully');
            setIsVideoLoading(false);
            cleanup();
            resolve(void 0);
          } catch (playError) {
            console.error('Play failed:', playError);
            setIsVideoLoading(false);
            cleanup();
            reject(playError);
          }
        };
        
        const onError = (e: any) => {
          console.error('Video error:', e);
          setIsVideoLoading(false);
          cleanup();
          reject(e);
        };
        
        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('error', onError);
        
        // Timeout fallback
        setTimeout(() => {
          cleanup();
          setIsVideoLoading(false);
          resolve(void 0);
        }, 5000);
      });
      
    } catch (error) {
      console.error('Video setup failed:', error);
      setIsVideoLoading(false);
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
          addLocalTranscriptMessage('user', finalTranscript.trim());
          
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

  // Add transcript message function for UI
  const addLocalTranscriptMessage = async (speaker: 'user' | 'ai', message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      speaker,
      message,
      timestamp: new Date()
    };
    
    setLocalTranscript(prev => [...prev, newMessage]);
    
    // Save to database if session exists (only for user messages, AI messages are saved in simulateAIResponse)
    if (currentSession && speaker === 'user') {
      try {
        await saveTranscriptToDatabase(currentSession.id, speaker, message);
      } catch (error) {
        console.error('Failed to save message to database:', error);
      }
    }
  };

  // Simulate AI response and save to database
  const simulateAIResponse = async (userMessage: string) => {
    const responses = [
      "That's interesting. Can you elaborate on that?",
      "Great point! Tell me more about your experience with that.",
      "How did that make you feel?",
      "What would you do differently next time?",
      "Can you give me a specific example?",
      "What challenges did you face in that situation?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Add to local transcript immediately
    addLocalTranscriptMessage('ai', randomResponse);
    
    // Save to database if session exists
    if (currentSession) {
      try {
        await saveTranscriptToDatabase(currentSession.id, 'ai', randomResponse);
      } catch (error) {
        console.error('Failed to save AI response to database:', error);
      }
    }
  };

  // Check existing permissions and auto-start if available
  const checkExistingPermissions = async () => {
    try {
      console.log('Checking existing permissions...');
      
      // Try to access media without showing permission dialog
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      console.log('Permissions already granted, starting media...');
      testStream.getTracks().forEach(track => track.stop()); // Stop test stream
      
      setShowPermissionRequest(false);
      await initializeMedia(); // Start actual media
      
    } catch (error: any) {
      console.log('Permissions not granted, showing request modal. Error:', error.name, error.message);
      setShowPermissionRequest(true);
    }
  };

  // Component mount effect
  useEffect(() => {
    // Check if there's already an active session
    const activeSession = sessionManager.getActiveSession();
    if (activeSession && activeSession.sessionId === sessionId) {
      console.log('Resuming existing session');
      // Resume existing session
      streamRef.current = activeSession.stream;
      recognitionRef.current = activeSession.recognition;
      setHasVideoPermission(true);
      setIsCameraOn(true);
      setShowPermissionRequest(false);
      
      if (activeSession.stream && videoRef.current) {
        setupVideo(activeSession.stream);
      }
      
      sessionManager.resumeSession();
    } else {
      // Check for new permissions
      checkExistingPermissions();
    }
    
    // No cleanup on unmount - session persists
  }, []);

  // Robust camera toggle that always works
  const toggleCamera = async () => {
    console.log('Camera toggle clicked, current state:', isCameraOn);
    
    if (!streamRef.current) {
      console.log('No stream, reinitializing...');
      await initializeMedia();
      return;
    }
    
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) {
      console.log('No video track, reinitializing...');
      await initializeMedia();
      return;
    }
    
    if (isCameraOn) {
      // Turn OFF
      console.log('Turning camera OFF');
      videoTrack.enabled = false;
      setIsCameraOn(false);
    } else {
      // Turn ON - use the same reliable logic as debug function
      console.log('Turning camera ON - using full reinitialize like debug');
      await debugVideoLogic();
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
  }, [localTranscript]);

  // Update session status to active when interview starts
  useEffect(() => {
    if (currentSession && currentSession.status === 'waiting' && hasVideoPermission) {
      updateSession(currentSession.id, { status: 'active' }).catch(console.error);
    }
  }, [currentSession, hasVideoPermission, updateSession]);

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

  const handleEndInterview = async () => {
    // End the session properly through session manager
    sessionManager.endSession();

    // Update session status to completed
    if (currentSession) {
      try {
        await updateSession(currentSession.id, { status: 'completed' });
        console.log('Interview session completed');
      } catch (error) {
        console.error('Failed to update session status:', error);
      }
    }

    navigate('/dashboard');
  };

  const handlePermissionGranted = async () => {
    console.log('Permission granted, initializing media...');
    setShowPermissionRequest(false);
    await initializeMedia();
  };

  const handlePermissionDenied = (error: string) => {
    console.log('Permission denied:', error);
    setPermissionError(error);
    setHasVideoPermission(false);
    setShowPermissionRequest(false);
  };

  // Debug function to manually test video (extracted logic for reuse)
  const debugVideoLogic = async () => {
    console.log('=== DEBUG VIDEO START ===');
    console.log('videoRef.current:', !!videoRef.current);
    console.log('streamRef.current:', !!streamRef.current);
    console.log('hasVideoPermission:', hasVideoPermission);
    console.log('isCameraOn:', isCameraOn);
    console.log('isVideoLoading:', isVideoLoading);
    
    if (streamRef.current) {
      console.log('Stream tracks:', streamRef.current.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })));
    }
    
    if (videoRef.current) {
      console.log('Video element:', {
        srcObject: !!videoRef.current.srcObject,
        readyState: videoRef.current.readyState,
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight,
        paused: videoRef.current.paused
      });
    }
    console.log('=== DEBUG VIDEO END ===');
    
    // Try to reinitialize
    try {
      await initializeMedia();
    } catch (e) {
      console.error('Debug reinitialize failed:', e);
    }
  };

  // Public debug function for the button
  const debugVideo = async () => {
    await debugVideoLogic();
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sessionManager.pauseSession();
              navigate('/dashboard');
            }}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Logo size="sm" clickable={false} />
          <span className="font-semibold text-lg">
            {currentSession?.title || 'AI Interview'}
          </span>
          {currentSession && (
            <span className="text-sm text-muted-foreground">
              • Session: {currentSession.id.slice(0, 8)}
            </span>
          )}
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

      {/* Error Display */}
      {(sessionError || permissionError) && (
        <div className="fixed top-16 left-0 right-0 z-40 mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800">{sessionError || permissionError}</p>
          </div>
        </div>
      )}

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
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <div className="text-center text-white">
                          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm">Loading camera...</p>
                        </div>
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
                   
                   {/* Debug Button - Temporary */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={debugVideo}
                      className="bg-background/80 backdrop-blur-sm text-xs"
                    >
                      {isCameraOn ? "Turn video off" : "Turn video on"}
                    </Button>
                  
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
                    {localTranscript.map((message) => (
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