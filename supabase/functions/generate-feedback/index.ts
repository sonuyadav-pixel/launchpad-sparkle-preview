import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranscriptMessage {
  speaker: string;
  message: string;
  timestamp: string;
}

interface FeedbackScores {
  overall_score: number;
  communication_score: number;
  body_language_score: number;
  domain_knowledge_score: number;
  confidence_score: number;
  clarity_score: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error('Session ID is required');
    }

    console.log('🔄 Generating feedback for session:', session_id);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user from request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // Get transcript messages
    const { data: transcripts, error: transcriptError } = await supabase
      .from('interview_transcripts')
      .select('*')
      .eq('session_id', session_id)
      .order('timestamp', { ascending: true });

    if (transcriptError) {
      throw new Error('Failed to fetch transcripts');
    }

    if (!transcripts || transcripts.length === 0) {
      throw new Error('No transcript found for this session');
    }

    // Check if feedback already exists
    const { data: existingFeedback } = await supabase
      .from('interview_feedback')
      .select('id')
      .eq('session_id', session_id)
      .single();

    if (existingFeedback) {
      return new Response(
        JSON.stringify({ message: 'Feedback already exists for this session' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare transcript for AI analysis
    const conversationText = transcripts
      .map((t: TranscriptMessage) => `${t.speaker}: ${t.message}`)
      .join('\n');

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('🤖 Analyzing transcript with AI...');

    // Generate feedback using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert interview coach. Analyze the interview transcript and provide detailed feedback.

Return a JSON object with this exact structure:
{
  "overall_score": number (0-10),
  "communication_score": number (0-10),
  "body_language_score": number (0-10, infer from language patterns),
  "domain_knowledge_score": number (0-10),
  "confidence_score": number (0-10),
  "clarity_score": number (0-10),
  "analysis_summary": "Brief 2-3 sentence summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "improvement_suggestions": [
    {
      "category": "communication|technical|presentation|confidence",
      "suggestion": "specific actionable advice",
      "priority": number (1-5, 1=highest),
      "is_premium": boolean
    }
  ]
}

Score criteria:
- Communication: Clarity, articulation, listening skills
- Body Language: Confidence indicators in speech patterns, pace, filler words
- Domain Knowledge: Technical accuracy, depth of understanding
- Confidence: Assertiveness, hesitation patterns, certainty in responses
- Clarity: Structure of answers, logical flow, conciseness

Focus on actionable feedback. Mark advanced suggestions as premium (is_premium: true).`
          },
          {
            role: 'user',
            content: `Interview Type: ${session.interview_type}\nTranscript:\n${conversationText}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const feedbackData = JSON.parse(aiData.choices[0].message.content);

    console.log('✅ AI feedback generated');

    // Store feedback in database
    const { data: feedback, error: feedbackError } = await supabase
      .from('interview_feedback')
      .insert({
        session_id: session_id,
        user_id: user.id,
        overall_score: feedbackData.overall_score,
        communication_score: feedbackData.communication_score,
        body_language_score: feedbackData.body_language_score,
        domain_knowledge_score: feedbackData.domain_knowledge_score,
        confidence_score: feedbackData.confidence_score,
        clarity_score: feedbackData.clarity_score,
        analysis_summary: feedbackData.analysis_summary,
        strengths: feedbackData.strengths,
        weaknesses: feedbackData.weaknesses,
      })
      .select()
      .single();

    if (feedbackError) {
      console.error('Failed to store feedback:', feedbackError);
      throw new Error('Failed to store feedback');
    }

    // Store improvement suggestions
    const suggestions = feedbackData.improvement_suggestions.map((suggestion: any) => ({
      feedback_id: feedback.id,
      category: suggestion.category,
      suggestion: suggestion.suggestion,
      priority: suggestion.priority,
      is_premium: suggestion.is_premium,
    }));

    const { error: suggestionsError } = await supabase
      .from('improvement_suggestions')
      .insert(suggestions);

    if (suggestionsError) {
      console.error('Failed to store suggestions:', suggestionsError);
      throw new Error('Failed to store improvement suggestions');
    }

    console.log('✅ Feedback stored successfully');

    return new Response(
      JSON.stringify({ 
        message: 'Feedback generated successfully',
        feedback_id: feedback.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error: any) {
    console.error('Generate feedback error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});