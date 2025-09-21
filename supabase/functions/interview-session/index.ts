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
    console.log('Starting interview-session function');
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service key available:', !!supabaseKey);
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    console.log('Auth result:', { user: user?.id, error: authError?.message });

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      throw new Error('Invalid authentication');
    }

    const { method, url } = req;
    const urlObj = new URL(url);
    const action = urlObj.searchParams.get('action');

    console.log(`Processing ${method} request with action: ${action}`);

    // For POST requests without action parameter, check the body
    let bodyAction = null;
    let body = null;
    
    if (method === 'POST') {
      try {
        body = await req.json();
        bodyAction = body?.action;
        console.log('Request body:', body);
      } catch (e) {
        console.error('Failed to parse request body:', e);
      }
    }

    const finalAction = action || bodyAction || (method === 'POST' ? 'create' : 'get');
    console.log('Final action determined:', finalAction);

    switch (finalAction) {
      case 'create': {
        console.log('Creating new session for user:', user.id);
        
        if (method !== 'POST') {
          throw new Error('Method not allowed for create action');
        }

        if (!body) {
          console.log('No body provided, using defaults');
          body = {};
        }
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
        if (method !== 'PUT' && method !== 'POST') {
          throw new Error('Method not allowed');
        }

        // For POST requests, we already have the body. For PUT requests, parse it.
        const requestBody = method === 'POST' ? body : await req.json();
        const { session_id, action, ...updates } = requestBody;

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

        // Use the already parsed body from earlier
        if (!body) {
          throw new Error('Request body is required');
        }
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
        console.error('Invalid action provided:', finalAction);
        throw new Error(`Invalid action: ${finalAction}`);
    }

  } catch (error) {
    console.error('Error in interview-session function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});