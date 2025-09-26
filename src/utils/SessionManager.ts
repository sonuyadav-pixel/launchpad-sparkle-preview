// Persistent session manager for maintaining interview sessions across navigation
export class SessionManager {
  private static instance: SessionManager;
  private activeSession: {
    sessionId: string;
    stream: MediaStream | null;
    recognition: any;
    isActive: boolean;
    startTime: Date;
    pausedTime: Date | null;
    participants: string[];
    title: string;
  } | null = null;

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  setActiveSession(sessionId: string, stream: MediaStream | null, recognition: any, title?: string) {
    console.log('Setting active session:', sessionId);
    this.activeSession = {
      sessionId,
      stream,
      recognition,
      isActive: true,
      startTime: new Date(), // This tracks when the session manager started, not the interview
      pausedTime: null,
      participants: ['You'], // For now, just the current user
      title: title || 'AI Interview Session'
    };
  }

  getActiveSession() {
    return this.activeSession;
  }

  pauseSession() {
    if (this.activeSession) {
      console.log('Pausing session:', this.activeSession.sessionId);
      this.activeSession.isActive = false;
      this.activeSession.pausedTime = new Date();
      
      // Pause speech recognition but keep stream active
      if (this.activeSession.recognition) {
        try {
          this.activeSession.recognition.stop();
        } catch (error) {
          console.warn('Error stopping recognition:', error);
        }
      }
    }
  }

  resumeSession() {
    if (this.activeSession) {
      console.log('Resuming session:', this.activeSession.sessionId);
      this.activeSession.isActive = true;
      this.activeSession.pausedTime = null;
      
      // Resume speech recognition
      if (this.activeSession.recognition) {
        try {
          this.activeSession.recognition.start();
        } catch (error) {
          console.warn('Error starting recognition:', error);
        }
      }
    }
  }

  getSessionDuration(): number {
    if (!this.activeSession) return 0;
    
    const now = new Date();
    const startTime = this.activeSession.startTime;
    return Math.floor((now.getTime() - startTime.getTime()) / 1000);
  }

  getTimeSincePaused(): number {
    if (!this.activeSession?.pausedTime) return 0;
    
    const now = new Date();
    return Math.floor((now.getTime() - this.activeSession.pausedTime.getTime()) / 1000);
  }

  shouldAutoClose(): boolean {
    return this.getTimeSincePaused() >= 300; // 5 minutes = 300 seconds
  }

  getSessionDetails() {
    if (!this.activeSession) return null;
    
    return {
      sessionId: this.activeSession.sessionId,
      title: this.activeSession.title,
      participants: this.activeSession.participants,
      duration: this.getSessionDuration(),
      timeSincePaused: this.getTimeSincePaused(),
      isActive: this.activeSession.isActive,
      shouldAutoClose: this.shouldAutoClose()
    };
  }

  endSession() {
    if (this.activeSession) {
      console.log('Ending session:', this.activeSession.sessionId);
      
      // Stop all media tracks
      if (this.activeSession.stream) {
        this.activeSession.stream.getTracks().forEach(track => track.stop());
      }
      
      // Stop speech recognition
      if (this.activeSession.recognition) {
        try {
          this.activeSession.recognition.stop();
        } catch (error) {
          console.warn('Error stopping recognition:', error);
        }
      }
      
      this.activeSession = null;
    }
  }

  hasActiveSession(): boolean {
    return this.activeSession !== null;
  }

  getActiveSessionId(): string | null {
    return this.activeSession?.sessionId || null;
  }

  isSessionActive(): boolean {
    return this.activeSession?.isActive || false;
  }
}

export const sessionManager = SessionManager.getInstance();
