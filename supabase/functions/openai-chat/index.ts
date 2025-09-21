import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('🤖 Generating AI response for:', message.substring(0, 50) + '...');

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare the conversation context
    const messages = [
      {
        role: 'system',
        content: `You are an AI interview assistant conducting a mock interview. Your role is to:
        - Ask relevant interview questions based on the conversation context
        - Provide constructive feedback when appropriate
        - Keep responses concise and conversational (1-2 sentences max)
        - Ask follow-up questions to dive deeper into responses
        - Maintain a professional yet friendly tone
        - Focus on behavioral, technical, or situational questions depending on the context`
      }
    ];

    // Add conversation context if provided
    if (context && context.length > 0) {
      context.forEach((msg: any) => {
        messages.push({
          role: msg.speaker === 'user' ? 'user' : 'assistant',
          content: msg.message
        });
      });
    }

    // Add the current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Generate response using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('🤖 Generated response:', aiResponse.substring(0, 50) + '...');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('OpenAI chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});