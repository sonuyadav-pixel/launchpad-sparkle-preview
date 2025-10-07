import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting store (in-memory for this instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Check rate limit: max 10 calls per minute per user
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  if (userLimit.count >= 10) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, userId } = await req.json();

    // Check rate limit
    if (!checkRateLimit(userId)) {
      console.log(`⚠️ Rate limit exceeded for user: ${userId}`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          response: "I apologize, but you're asking questions too quickly. Please take a moment before continuing."
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📝 Processing message from user ${userId}:`, message);

    // Get Llama API configuration from secrets
    const LLAMA_API_URL = Deno.env.get('LLAMA_API_URL');
    
    if (!LLAMA_API_URL) {
      throw new Error('LLAMA_API_URL not configured');
    }

    // Build conversation history and combine into a single prompt
    let prompt = `You are an experienced technical interviewer conducting a professional job interview. 
Your goal is to:
- Ask thoughtful, relevant questions based on the candidate's responses
- Assess technical knowledge, problem-solving abilities, and communication skills
- Provide a conversational yet professional interview experience
- Ask follow-up questions to dive deeper into topics
- Keep questions concise and clear
- Be encouraging but maintain professional standards

Context: This is a real-time voice interview, so keep your responses brief and conversational (2-3 sentences max per turn).\n\n`;

    // Add conversation context
    if (context && Array.isArray(context)) {
      context.forEach((msg: any) => {
        const speaker = msg.speaker === 'ai' ? 'Assistant' : 'User';
        prompt += `${speaker}: ${msg.message}\n`;
      });
    }

    // Add current user message
    prompt += `User: ${message}\nAssistant:`;

    console.log(`🤖 Calling Llama API at: ${LLAMA_API_URL}`);

    // Get Llama API key
    const LLAMA_API_KEY = Deno.env.get('LLAMA_API_KEY');

    // Call your Llama 3.1 API
    const llamaResponse = await fetch(LLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LLAMA_API_KEY || ''
      },
      body: JSON.stringify({
        model: "llama3.1",
        prompt: prompt
      })
    });

    if (!llamaResponse.ok) {
      const errorText = await llamaResponse.text();
      console.error(`❌ Llama API error (${llamaResponse.status}):`, errorText);
      throw new Error(`Llama API error: ${llamaResponse.status}`);
    }

    // Read the streaming response and combine all tokens
    const responseText = await llamaResponse.text();
    console.log(`📥 Raw response (first 200 chars):`, responseText.substring(0, 200));
    
    // Split by newlines and parse each JSON object
    const lines = responseText.trim().split('\n');
    let combinedResponse = '';
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const chunk = JSON.parse(line);
          if (chunk.response) {
            combinedResponse += chunk.response;
          }
        } catch (e) {
          console.warn('Failed to parse line:', line);
        }
      }
    }

    const aiResponse = combinedResponse || "I understand. Could you tell me more about that?";
    console.log(`✅ Generated complete response (${combinedResponse.length} chars):`, aiResponse.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error in llama-chat function:', error);
    
    // Return a fallback response instead of exposing the error
    return new Response(
      JSON.stringify({ 
        response: "I see. Can you elaborate on that point? I'd like to understand your perspective better.",
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 200, // Return 200 so the interview continues
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
