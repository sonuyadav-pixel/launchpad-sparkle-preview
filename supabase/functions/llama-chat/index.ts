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

    // Get Llama API URL from secrets
    const LLAMA_API_URL = Deno.env.get('LLAMA_API_URL');
    if (!LLAMA_API_URL) {
      throw new Error('LLAMA_API_URL not configured');
    }

    // Build conversation history for Llama
    const messages = [
      {
        role: "system",
        content: `You are an experienced technical interviewer conducting a professional job interview. 
Your goal is to:
- Ask thoughtful, relevant questions based on the candidate's responses
- Assess technical knowledge, problem-solving abilities, and communication skills
- Provide a conversational yet professional interview experience
- Ask follow-up questions to dive deeper into topics
- Keep questions concise and clear
- Be encouraging but maintain professional standards

Context: This is a real-time voice interview, so keep your responses brief and conversational (2-3 sentences max per turn).`
      }
    ];

    // Add conversation context
    if (context && Array.isArray(context)) {
      context.forEach((msg: any) => {
        messages.push({
          role: msg.speaker === 'ai' ? 'assistant' : 'user',
          content: msg.message
        });
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message
    });

    console.log(`🤖 Calling Llama API at: ${LLAMA_API_URL}`);

    // Call your Llama 3.1 API
    const llamaResponse = await fetch(LLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3.1-70B-Instruct", // Adjust if your model name is different
        messages: messages,
        temperature: 0.7,
        max_tokens: 150, // Keep responses brief for voice
        stream: false
      })
    });

    if (!llamaResponse.ok) {
      const errorText = await llamaResponse.text();
      console.error(`❌ Llama API error (${llamaResponse.status}):`, errorText);
      throw new Error(`Llama API error: ${llamaResponse.status}`);
    }

    const llamaData = await llamaResponse.json();
    const aiResponse = llamaData.choices?.[0]?.message?.content || 
                       llamaData.response || // Some APIs use this format
                       "I understand. Could you tell me more about that?";

    console.log(`✅ Generated response:`, aiResponse);

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
