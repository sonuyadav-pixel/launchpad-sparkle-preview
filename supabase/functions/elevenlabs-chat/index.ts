import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Check rate limit (max 10 calls per minute per user)
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const minuteWindow = 60 * 1000; // 1 minute
  const maxCalls = 10;

  const userLimit = rateLimitStore.get(userId) || { count: 0, resetTime: now + minuteWindow };
  
  // Reset if window expired
  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + minuteWindow;
  }
  
  // Check if limit exceeded
  if (userLimit.count >= maxCalls) {
    return false;
  }
  
  // Increment count
  userLimit.count++;
  rateLimitStore.set(userId, userLimit);
  return true;
}

// Simple response cache to avoid duplicate API calls
const responseCache = new Map<string, { response: string; timestamp: number }>();

function getCachedResponse(key: string): string | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
    return cached.response;
  }
  return null;
}

function setCachedResponse(key: string, response: string): void {
  responseCache.set(key, { response, timestamp: Date.now() });
  
  // Clean old cache entries
  if (responseCache.size > 100) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) {
      responseCache.delete(oldestKey);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, context, userId } = await req.json()

    if (!message) {
      throw new Error('Message is required')
    }

    // Use a fallback userId if not provided
    const requestUserId = userId || 'anonymous';

    // Check rate limit
    if (!checkRateLimit(requestUserId)) {
      console.log('🚫 Rate limit exceeded for user:', requestUserId);
      return new Response(
        JSON.stringify({ 
          response: "I need a moment to process. Please wait a bit before continuing.",
          rateLimited: true 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    console.log('🤖 Generating AI response for:', message.substring(0, 50) + '...')

    // Check cache first
    const cacheKey = `${requestUserId}:${message.toLowerCase().trim()}`;
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      console.log('📋 Using cached response');
      return new Response(
        JSON.stringify({ response: cachedResponse, cached: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Use local AI response generation instead of ElevenLabs API
    console.log('🤖 Generating local AI response')
    
    // Build conversation history for context-aware responses
    let conversationHistory = '';
    if (context && Array.isArray(context) && context.length > 0) {
      conversationHistory = context.slice(-3).map((msg: any) => 
        `${msg.speaker === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.message}`
      ).join('\n');
    }

    // Context-aware interview responses based on message content
    const messageWords = message.toLowerCase().trim();
    let response = '';

    // Different responses based on content
    if (messageWords.includes('hello') || messageWords.includes('welcome') || messageWords.includes('hi')) {
      response = "Thank you for joining the interview! I'm excited to learn about your background and experience. Could you start by telling me about yourself and your professional journey?";
    } else if (messageWords.includes('experience') || messageWords.includes('work') || messageWords.includes('job')) {
      response = "That sounds like valuable experience. What specific challenges did you face in that role, and how did you overcome them?";
    } else if (messageWords.includes('project') || messageWords.includes('built') || messageWords.includes('developed')) {
      response = "Interesting project! What technologies did you use, and what was the most challenging aspect of the implementation?";
    } else if (messageWords.includes('ai') || messageWords.includes('artificial intelligence') || messageWords.includes('machine learning')) {
      response = "AI is such a rapidly evolving field. How do you stay current with the latest developments, and what excites you most about working with AI technologies?";
    } else if (messageWords.includes('team') || messageWords.includes('collaborate') || messageWords.includes('leader')) {
      response = "Teamwork is crucial in most roles. Can you share an example of how you've successfully collaborated with others or led a team through a difficult project?";
    } else if (messageWords.includes('challenge') || messageWords.includes('difficult') || messageWords.includes('problem')) {
      response = "Problem-solving is a key skill. What's your approach when you encounter a challenge you haven't faced before?";
    } else if (messageWords.includes('learn') || messageWords.includes('skill') || messageWords.includes('growth')) {
      response = "Continuous learning is important in technology. What's the most significant skill or technology you've learned recently, and how did you go about mastering it?";
    } else if (context && context.length > 2) {
      // Generate follow-up questions based on conversation flow
      const followUpQuestions = [
        "That's insightful. How would you apply that experience to this role?",
        "I see. What impact did that have on the overall project or team?",
        "Excellent point. What would you do differently if you faced a similar situation again?",
        "That's valuable experience. How did that shape your approach to future projects?",
        "Great example. What lessons from that experience do you still apply today?",
        "Interesting approach. How do you measure the success of such initiatives?",
        "That sounds challenging. What support or resources did you leverage to succeed?",
        "Good insight. How do you balance innovation with practical constraints?",
        "That's a thoughtful perspective. What advice would you give to someone facing a similar challenge?",
        "Excellent work. What aspects of that project are you most proud of?"
      ];
      response = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];
    } else {
      // General interview responses
      const generalResponses = [
        "That's interesting. Could you elaborate on that and provide more specific details?",
        "I'd like to understand more about your thought process. What led you to that conclusion?",
        "That's a good point. How does that relate to your career goals and aspirations?",
        "Can you walk me through a specific example that demonstrates this experience?",
        "What role did you play in that situation, and what was the outcome?",
        "How do you think that experience has prepared you for this position?",
        "What did you learn from that experience that you still apply today?",
        "That's valuable insight. What would you say was the most important factor in your success?"
      ];
      response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }

    // Cache the response
    setCachedResponse(cacheKey, response);
    
    console.log('✅ Generated AI response locally');

    return new Response(
      JSON.stringify({ response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('ElevenLabs chat error:', error)
    
    // Fallback response
    const fallbackResponse = "I appreciate you sharing that. Could you tell me more about your experience and what motivates you in your work?"
    
    return new Response(
      JSON.stringify({ response: fallbackResponse }),
      {
        status: 200, // Return 200 with fallback instead of error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})