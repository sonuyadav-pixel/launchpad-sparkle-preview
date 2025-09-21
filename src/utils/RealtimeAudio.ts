// Audio recording and encoding utilities for real-time interview system

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  
  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      console.log('🎤 Starting audio recorder...');
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      console.log('✅ Audio recorder started successfully');
    } catch (error) {
      console.error('❌ Error starting audio recorder:', error);
      throw error;
    }
  }

  stop() {
    console.log('🛑 Stopping audio recorder...');
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Encode Float32 audio to base64 PCM16
export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

// Audio queue for sequential playback
export class AudioQueue {
  private queue: ArrayBuffer[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: ArrayBuffer) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      this.playNext(); // Continue with next segment
    }
  }

  clear() {
    this.queue = [];
  }
}

// WebSocket-based realtime chat client
export class RealtimeInterviewClient {
  private ws: WebSocket | null = null;
  private audioRecorder: AudioRecorder | null = null;
  private audioQueue: AudioQueue | null = null;
  private audioContext: AudioContext | null = null;
  private chunkSequence = 0;
  private isConnected = false;

  constructor(
    private sessionId: string,
    private userId: string,
    private onMessage: (message: any) => void
  ) {}

  async connect() {
    try {
      console.log('🔌 Connecting to realtime interview...');
      
      // Initialize audio context
      this.audioContext = new AudioContext();
      this.audioQueue = new AudioQueue(this.audioContext);
      
      // Connect WebSocket
      const wsUrl = `wss://ecrxtqvkncbbolmfqpxx.functions.supabase.co/realtime-interview?sessionId=${this.sessionId}&userId=${this.userId}`;
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnected = true;
        this.onMessage({ type: 'connected' });
      };
      
      this.ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 Received:', data.type);
        
        switch (data.type) {
          case 'stt-partial':
            this.onMessage({ type: 'transcript-partial', text: data.text });
            break;
          case 'stt-final':
            this.onMessage({ type: 'transcript-final', text: data.text });
            break;
          case 'bot-text-final':
            this.onMessage({ type: 'bot-response', text: data.text });
            break;
          case 'bot-audio-chunk':
            if (this.audioQueue) {
              const binaryString = atob(data.data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              await this.audioQueue.addToQueue(bytes.buffer);
            }
            break;
          case 'bot-audio-complete':
            this.onMessage({ type: 'bot-audio-complete' });
            break;
          case 'error':
            console.error('❌ Server error:', data.error);
            this.onMessage({ type: 'error', error: data.error });
            break;
          default:
            this.onMessage(data);
        }
      };
      
      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnected = false;
        this.onMessage({ type: 'disconnected' });
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.onMessage({ type: 'error', error: 'WebSocket connection failed' });
      };
      
    } catch (error) {
      console.error('❌ Connection error:', error);
      throw error;
    }
  }

  async startAudioRecording() {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }
    
    try {
      console.log('🎤 Starting audio recording...');
      
      this.audioRecorder = new AudioRecorder((audioData) => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          const base64Audio = encodeAudioForAPI(audioData);
          this.ws.send(JSON.stringify({
            type: 'audio-chunk',
            chunkId: `chunk_${this.chunkSequence}`,
            format: 'pcm16',
            data: base64Audio,
            seq: this.chunkSequence++
          }));
        }
      });
      
      await this.audioRecorder.start();
      console.log('✅ Audio recording started');
      
    } catch (error) {
      console.error('❌ Failed to start audio recording:', error);
      throw error;
    }
  }

  stopAudioRecording() {
    if (this.audioRecorder) {
      this.audioRecorder.stop();
      this.audioRecorder = null;
      console.log('🛑 Audio recording stopped');
    }
  }

  sendTextMessage(text: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'text-message',
        text: text
      }));
    }
  }

  sendSpeechEnd(turnId?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'user-speech-end',
        turnId: turnId || Date.now().toString()
      }));
    }
  }

  disconnect() {
    console.log('🔌 Disconnecting...');
    
    this.stopAudioRecording();
    
    if (this.audioQueue) {
      this.audioQueue.clear();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}