import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InterviewSession {
  id?: string;
  user_id: string;
  title: string;
  status: 'waiting' | 'active' | 'paused' | 'completed' | 'cancelled';
  interview_type: 'general' | 'technical' | 'behavioral' | 'custom';
  settings?: any;
  metadata?: any;
}

interface TranscriptMessage {
  session_id: string;
  speaker: 'user' | 'ai';
  message: string;
  metadata?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { method, url } = req;
    const urlObj = new URL(url);
    const action = urlObj.searchParams.get('action');

    console.log(`Processing ${method} request with action: ${action}`);

    switch (action) {
      case 'create': {
        if (method !== 'POST') {
          throw new Error('Method not allowed');
        }

        const body = await req.json();
        const sessionData: InterviewSession = {
          user_id: user.id,
          title: body.title || 'AI Interview Session',
          status: 'waiting',
          interview_type: body.interview_type || 'general',
          settings: body.settings || {},
          metadata: body.metadata || {}
        };

        const { data: session, error } = await supabase
          .from('interview_sessions')
          .insert(sessionData)
          .select()
          .single();

        if (error) {
          console.error('Error creating session:', error);
          throw error;
        }

        console.log('Session created:', session.id);
        return new Response(JSON.stringify({ session }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update': {
        if (method !== 'PUT') {
          throw new Error('Method not allowed');
        }

        const body = await req.json();
        const { session_id, ...updates } = body;

        if (!session_id) {
          throw new Error('Session ID is required');
        }

        const { data: session, error } = await supabase
          .from('interview_sessions')
          .update(updates)
          .eq('id', session_id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating session:', error);
          throw error;
        }

        console.log('Session updated:', session.id, 'Status:', session.status);
        return new Response(JSON.stringify({ session }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get': {
        if (method !== 'GET') {
          throw new Error('Method not allowed');
        }

        const sessionId = urlObj.searchParams.get('session_id');
        
        if (sessionId) {
          // Get specific session
          const { data: session, error } = await supabase
            .from('interview_sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching session:', error);
            throw error;
          }

          return new Response(JSON.stringify({ session }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get user's sessions
          const status = urlObj.searchParams.get('status');
          let query = supabase
            .from('interview_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (status) {
            query = query.eq('status', status);
          }

          const { data: sessions, error } = await query;

          if (error) {
            console.error('Error fetching sessions:', error);
            throw error;
          }

          return new Response(JSON.stringify({ sessions }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'add-transcript': {
        if (method !== 'POST') {
          throw new Error('Method not allowed');
        }

        const body = await req.json();
        const transcriptData: TranscriptMessage = {
          session_id: body.session_id,
          speaker: body.speaker,
          message: body.message,
          metadata: body.metadata || {}
        };

        // Verify session belongs to user
        const { data: session, error: sessionError } = await supabase
          .from('interview_sessions')
          .select('id')
          .eq('id', body.session_id)
          .eq('user_id', user.id)
          .single();

        if (sessionError || !session) {
          throw new Error('Session not found or access denied');
        }

        const { data: transcript, error } = await supabase
          .from('interview_transcripts')
          .insert(transcriptData)
          .select()
          .single();

        if (error) {
          console.error('Error adding transcript:', error);
          throw error;
        }

        console.log('Transcript added to session:', session.id);
        return new Response(JSON.stringify({ transcript }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-transcript': {
        if (method !== 'GET') {
          throw new Error('Method not allowed');
        }

        const sessionId = urlObj.searchParams.get('session_id');
        if (!sessionId) {
          throw new Error('Session ID is required');
        }

        // Verify session belongs to user
        const { data: session, error: sessionError } = await supabase
          .from('interview_sessions')
          .select('id')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .single();

        if (sessionError || !session) {
          throw new Error('Session not found or access denied');
        }

        const { data: transcripts, error } = await supabase
          .from('interview_transcripts')
          .select('*')
          .eq('session_id', sessionId)
          .order('timestamp', { ascending: true });

        if (error) {
          console.error('Error fetching transcript:', error);
          throw error;
        }

        return new Response(JSON.stringify({ transcripts }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in interview-session function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});