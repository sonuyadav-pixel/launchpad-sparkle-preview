import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduledInterview {
  id?: string;
  user_id?: string;
  candidate_name: string;
  interview_title: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'missed';
  session_id?: string;
  invited_email: string;
  created_at?: string;
  updated_at?: string;
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
    const interviewId = pathParts[pathParts.length - 1];

    console.log(`Processing ${method} request for user ${user.id}`);

    switch (method) {
      case 'GET':
        if (interviewId && interviewId !== 'scheduled-interviews') {
          // Get specific interview
          const { data, error } = await supabase
            .from('scheduled_interviews')
            .select('*')
            .eq('id', interviewId)
            .single();

          if (error) {
            console.error('Error fetching interview:', error);
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify(data),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get all interviews for user
          const { data, error } = await supabase
            .from('scheduled_interviews')
            .select('*')
            .order('scheduled_at', { ascending: true });

          if (error) {
            console.error('Error fetching interviews:', error);
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

      case 'POST':
        const newInterview: ScheduledInterview = await req.json();
        
        // Validate required fields
        if (!newInterview.candidate_name || !newInterview.interview_title || !newInterview.invited_email || !newInterview.scheduled_at) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate email format
        if (!newInterview.invited_email.includes('@') || !newInterview.invited_email.endsWith('.com')) {
          return new Response(
            JSON.stringify({ error: 'Invalid email format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('scheduled_interviews')
          .insert([{
            ...newInterview,
            user_id: user.id
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating interview:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Interview created successfully:', data.id);
        return new Response(
          JSON.stringify(data),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'PUT':
        const updates: Partial<ScheduledInterview> = await req.json();
        
        const { data: updateData, error: updateError } = await supabase
          .from('scheduled_interviews')
          .update(updates)
          .eq('id', interviewId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating interview:', updateError);
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Interview updated successfully:', interviewId);
        return new Response(
          JSON.stringify(updateData),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('scheduled_interviews')
          .delete()
          .eq('id', interviewId);

        if (deleteError) {
          console.error('Error deleting interview:', deleteError);
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Interview deleted successfully:', interviewId);
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);