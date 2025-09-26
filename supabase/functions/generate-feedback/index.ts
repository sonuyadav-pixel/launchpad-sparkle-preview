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

    // Get Perplexity API key
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    console.log('🤖 Analyzing transcript with AI...');

    // Generate feedback using Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview coach. Be precise and concise. Return ONLY valid JSON.'
          },
          {
            role: 'user',
            content: `Analyze this interview transcript and provide feedback. Return ONLY a valid JSON object:

{
  "overall_score": 7.5,
  "communication_score": 8.0,
  "body_language_score": 7.0,
  "domain_knowledge_score": 8.5,
  "confidence_score": 7.5,
  "clarity_score": 8.0,
  "analysis_summary": "Good overall performance with strong technical knowledge.",
  "strengths": ["Clear communication", "Good technical depth", "Confident responses"],
  "weaknesses": ["Could improve body language", "Some hesitation in answers", "Needs better structure"],
  "improvement_suggestions": [
    {
      "category": "communication",
      "suggestion": "Practice speaking more confidently",
      "priority": 1,
      "is_premium": false
    },
    {
      "category": "technical",
      "suggestion": "Review advanced algorithms",
      "priority": 2,
      "is_premium": true
    }
  ]
}

Interview: ${session.interview_type}
Transcript: ${conversationText}

Return ONLY the JSON object above with your analysis.`
          }
        ],
        temperature: 0.2,
        max_tokens: 800,
        return_images: false,
        return_related_questions: false,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const aiData = await response.json();
    console.log('🔍 Raw AI response:', JSON.stringify(aiData));
    
    let feedbackContent;
    if (aiData.choices && aiData.choices[0] && aiData.choices[0].message) {
      feedbackContent = aiData.choices[0].message.content;
    } else {
      console.error('Unexpected API response structure:', aiData);
      throw new Error('Invalid API response structure');
    }

    // Clean the content and parse JSON
    const cleanContent = feedbackContent.trim()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*({.*})[^}]*$/s, '$1');

    let feedbackData;
    try {
      feedbackData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content to parse:', cleanContent);
      throw new Error(`Failed to parse AI response: ${(parseError as Error).message || 'Unknown error'}`);
    }

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