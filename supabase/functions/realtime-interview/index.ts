import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AudioChunk {
  chunkId: string;
  format: 'pcm16' | 'opus';
  data: string; // base64 encoded
  seq: number;
}

interface SessionData {
  sessionId: string;
  userId: string;
  ws?: WebSocket;
  sttProvider?: any;
  conversationContext: Array<{role: string, content: string}>;
  lastProcessed: number;
  isProcessing: boolean;
}

// Store active sessions
const activeSessions = new Map<string, SessionData>();

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId');
  const userId = url.searchParams.get('userId');

  if (!sessionId || !userId) {
    return new Response("Missing sessionId or userId", { status: 400 });
  }

  console.log(`🚀 WebSocket connection for session: ${sessionId}, user: ${userId}`);

  const { socket, response } = Deno.upgradeWebSocket(req);

  // Initialize session data
  const sessionData: SessionData = {
    sessionId,
    userId,
    ws: socket,
    conversationContext: [{
      role: 'system',
      content: 'You are a professional AI interviewer. Ask relevant follow-up questions, provide constructive feedback, and maintain a professional but friendly tone. Keep responses concise and conversational.'
    }],
    lastProcessed: 0,
    isProcessing: false
  };

  activeSessions.set(sessionId, sessionData);

  socket.onopen = () => {
    console.log(`✅ WebSocket opened for session: ${sessionId}`);
    socket.send(JSON.stringify({
      type: 'connection-established',
      sessionId,
      message: 'Real-time interview session ready'
    }));
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log(`📨 Received message type: ${data.type} for session: ${sessionId}`);

      switch (data.type) {
        case 'audio-chunk':
          await handleAudioChunk(sessionData, data);
          break;
        case 'text-message':
          await handleTextMessage(sessionData, data);
          break;
        case 'user-speech-end':
          await handleSpeechEnd(sessionData, data);
          break;
        case 'ping':
          socket.send(JSON.stringify({ type: 'pong' }));
          break;
        default:
          console.log(`🤷 Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error(`❌ Error processing message:`, error);
      socket.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  };

  socket.onclose = () => {
    console.log(`🔌 WebSocket closed for session: ${sessionId}`);
    activeSessions.delete(sessionId);
  };

  socket.onerror = (error) => {
    console.error(`❌ WebSocket error for session: ${sessionId}:`, error);
    activeSessions.delete(sessionId);
  };

  return response;
});

async function handleAudioChunk(sessionData: SessionData, data: AudioChunk) {
  try {
    console.log(`🎵 Processing audio chunk ${data.seq} for session: ${sessionData.sessionId}`);
    
    // Decode base64 audio data
    const binaryAudio = atob(data.data);
    const audioBytes = new Uint8Array(binaryAudio.length);
    for (let i = 0; i < binaryAudio.length; i++) {
      audioBytes[i] = binaryAudio.charCodeAt(i);
    }

    // Convert audio to text using OpenAI Whisper
    const transcription = await transcribeAudio(audioBytes);
    
    if (transcription) {
      // Send partial transcript
      sessionData.ws?.send(JSON.stringify({
        type: 'stt-partial',
        text: transcription,
        seq: data.seq,
        interim: false
      }));

      // Process for AI response if significant speech detected
      if (transcription.length > 3 && !sessionData.isProcessing) {
        await processTranscriptForAI(sessionData, transcription);
      }
    }
  } catch (error) {
    console.error(`❌ Error handling audio chunk:`, error);
    sessionData.ws?.send(JSON.stringify({
      type: 'error',
      error: 'Failed to process audio chunk'
    }));
  }
}

async function handleTextMessage(sessionData: SessionData, data: { text: string }) {
  try {
    console.log(`📝 Processing text message for session: ${sessionData.sessionId}`);
    
    // Send final transcript
    sessionData.ws?.send(JSON.stringify({
      type: 'stt-final',
      text: data.text,
      confidence: 1.0
    }));

    // Save to database
    await saveTranscriptMessage(sessionData.sessionId, 'user', data.text);

    // Process for AI response
    await processTranscriptForAI(sessionData, data.text);
  } catch (error) {
    console.error(`❌ Error handling text message:`, error);
  }
}

async function handleSpeechEnd(sessionData: SessionData, data: { turnId?: string }) {
  try {
    console.log(`🏁 Speech end detected for session: ${sessionData.sessionId}`);
    
    sessionData.ws?.send(JSON.stringify({
      type: 'turn-complete',
      turnId: data.turnId || Date.now().toString()
    }));
  } catch (error) {
    console.error(`❌ Error handling speech end:`, error);
  }
}

async function transcribeAudio(audioBytes: Uint8Array): Promise<string | null> {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create form data for Whisper API
    const formData = new FormData();
    const blob = new Blob([audioBytes], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'text');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API error:', response.status, errorText);
      return null;
    }

    const transcription = await response.text();
    console.log(`🎤 Transcribed: "${transcription}"`);
    return transcription.trim();
  } catch (error) {
    console.error('❌ Transcription error:', error);
    return null;
  }
}

async function processTranscriptForAI(sessionData: SessionData, text: string) {
  if (sessionData.isProcessing) {
    console.log('🚫 Already processing, skipping...');
    return;
  }

  const now = Date.now();
  if (now - sessionData.lastProcessed < 2000) {
    console.log('🚫 Rate limited, skipping...');
    return;
  }

  sessionData.isProcessing = true;
  sessionData.lastProcessed = now;

  try {
    console.log(`🤖 Generating AI response for: "${text}"`);

    // Add user message to context
    sessionData.conversationContext.push({
      role: 'user',
      content: text
    });

    // Generate AI response
    const aiResponse = await generateAIResponse(sessionData.conversationContext);
    
    if (aiResponse) {
      // Add AI response to context
      sessionData.conversationContext.push({
        role: 'assistant',
        content: aiResponse
      });

      // Send bot text
      sessionData.ws?.send(JSON.stringify({
        type: 'bot-text-final',
        text: aiResponse
      }));

      // Save to database
      await saveTranscriptMessage(sessionData.sessionId, 'ai', aiResponse);

      // Generate TTS audio and stream
      await generateAndStreamTTS(sessionData, aiResponse);
    }
  } catch (error) {
    console.error(`❌ Error processing transcript for AI:`, error);
    sessionData.ws?.send(JSON.stringify({
      type: 'error',
      error: 'Failed to generate AI response'
    }));
  } finally {
    sessionData.isProcessing = false;
  }
}

async function generateAIResponse(context: Array<{role: string, content: string}>): Promise<string | null> {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: context.slice(-10), // Keep last 10 messages for context
        max_tokens: 150,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    console.log(`🤖 Generated response: "${aiResponse}"`);
    return aiResponse;
  } catch (error) {
    console.error('❌ AI response generation error:', error);
    return null;
  }
}

async function generateAndStreamTTS(sessionData: SessionData, text: string) {
  try {
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      console.log('📢 No ElevenLabs API key, skipping TTS');
      return;
    }

    console.log(`🔊 Generating TTS for: "${text}"`);

    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x/stream', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      }),
    });

    if (!response.ok) {
      console.error('ElevenLabs TTS error:', response.status);
      return;
    }

    // Stream audio chunks
    const reader = response.body?.getReader();
    if (!reader) return;

    let chunkIndex = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Convert to base64 and send
      const base64Audio = btoa(String.fromCharCode(...value));
      sessionData.ws?.send(JSON.stringify({
        type: 'bot-audio-chunk',
        seq: chunkIndex++,
        data: base64Audio
      }));
    }

    // Signal audio complete
    sessionData.ws?.send(JSON.stringify({
      type: 'bot-audio-complete'
    }));

    console.log('🔊 TTS streaming complete');
  } catch (error) {
    console.error('❌ TTS generation error:', error);
  }
}

async function saveTranscriptMessage(sessionId: string, speaker: string, message: string) {
  try {
    const { error } = await supabase
      .from('interview_transcripts')
      .insert({
        session_id: sessionId,
        speaker: speaker,
        message: message,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Database save error:', error);
    } else {
      console.log(`💾 Saved ${speaker} message to database`);
    }
  } catch (error) {
    console.error('❌ Database save error:', error);
  }
}