import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InterviewSession {
  id?: string;
  user_id?: string;
  title: string;
  status: 'waiting' | 'active' | 'paused' | 'completed' | 'cancelled' | 'abandoned';
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  interview_type: string;
  settings?: any;
  metadata?: any;
  created_at?: string;
}

interface InterviewTranscript {
  id?: string;
  session_id: string;
  speaker: string;
  message: string;
  timestamp?: string;
  metadata?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set the user context for RLS
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const method = req.method;
    const pathParts = url.pathname.split('/');
    const resource = pathParts[pathParts.length - 2]; // 'sessions' or 'transcripts'
    const resourceId = pathParts[pathParts.length - 1];

    console.log(`Processing ${method} request for ${resource} by user ${user.id}`);

    switch (method) {
      case 'GET':
        if (resource === 'sessions') {
          if (resourceId && resourceId !== 'sessions') {
            // Get specific session with transcripts
            const { data: sessionData, error: sessionError } = await supabase
              .from('interview_sessions')
              .select(`
                *,
                interview_transcripts(*)
              `)
              .eq('id', resourceId)
              .single();

            if (sessionError) {
              console.error('Error fetching session:', sessionError);
              return new Response(
                JSON.stringify({ error: sessionError.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }

            return new Response(
              JSON.stringify(sessionData),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else {
            // Get all sessions for user
            const { data, error } = await supabase
              .from('interview_sessions')
              .select('*')
              .order('created_at', { ascending: false });

            if (error) {
              console.error('Error fetching sessions:', error);
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }

            return new Response(
              JSON.stringify(data || []),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else if (resource === 'transcripts') {
          // Get transcripts for a session
          const sessionId = url.searchParams.get('session_id');
          if (!sessionId) {
            return new Response(
              JSON.stringify({ error: 'session_id parameter required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const { data, error } = await supabase
            .from('interview_transcripts')
            .select('*')
            .eq('session_id', sessionId)
            .order('timestamp', { ascending: true });

          if (error) {
            console.error('Error fetching transcripts:', error);
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify(data || []),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;

      case 'POST':
        if (resource === 'sessions') {
          const newSession: InterviewSession = await req.json();
          
          // Validate required fields
          if (!newSession.title || !newSession.interview_type) {
            return new Response(
              JSON.stringify({ error: 'Missing required fields' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const { data, error } = await supabase
            .from('interview_sessions')
            .insert([{
              ...newSession,
              user_id: user.id
            }])
            .select()
            .single();

          if (error) {
            console.error('Error creating session:', error);
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log('Session created successfully:', data.id);
          return new Response(
            JSON.stringify(data),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (resource === 'transcripts') {
          const newTranscript: InterviewTranscript = await req.json();
          
          // Validate required fields
          if (!newTranscript.session_id || !newTranscript.speaker || !newTranscript.message) {
            return new Response(
              JSON.stringify({ error: 'Missing required fields' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const { data, error } = await supabase
            .from('interview_transcripts')
            .insert([newTranscript])
            .select()
            .single();

          if (error) {
            console.error('Error creating transcript:', error);
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log('Transcript created successfully:', data.id);
          return new Response(
            JSON.stringify(data),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;

      case 'PUT':
        if (resource === 'sessions') {
          const updates: Partial<InterviewSession> = await req.json();
          
          const { data, error } = await supabase
            .from('interview_sessions')
            .update(updates)
            .eq('id', resourceId)
            .select()
            .single();

          if (error) {
            console.error('Error updating session:', error);
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log('Session updated successfully:', resourceId);
          return new Response(
            JSON.stringify(data),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;

      case 'DELETE':
        if (resource === 'sessions') {
          const { error } = await supabase
            .from('interview_sessions')
            .delete()
            .eq('id', resourceId);

          if (error) {
            console.error('Error deleting session:', error);
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log('Session deleted successfully:', resourceId);
          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);