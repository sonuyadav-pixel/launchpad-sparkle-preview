import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, context } = await req.json()

    if (!message) {
      throw new Error('Message is required')
    }

    console.log('🤖 Generating AI response using ElevenLabs for:', message.substring(0, 50) + '...')

    // Get ElevenLabs API key
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    // Build conversation history for context
    let conversationHistory = '';
    if (context && Array.isArray(context)) {
      conversationHistory = context.map((msg: any) => 
        `${msg.speaker === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.message}`
      ).join('\n');
    }

    // Create a comprehensive prompt for the AI interview
    const systemPrompt = `You are an experienced AI interviewer conducting a professional job interview. 

Context: This is a technical interview session where you should:
- Ask relevant follow-up questions based on the candidate's responses
- Probe deeper into their technical knowledge and experience
- Ask about specific projects, challenges they've faced, and problem-solving approaches
- Keep questions professional and interview-appropriate
- Be encouraging but thorough in your evaluation
- Ask one question at a time
- Keep responses concise but meaningful

Previous conversation:
${conversationHistory}

Current candidate response: ${message}

Provide a thoughtful interviewer response that moves the interview forward constructively.`;

    // Use ElevenLabs Conversational AI API
    const response = await fetch('https://api.elevenlabs.io/v1/convai/conversation', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        model_id: 'eleven_multilingual_v2',
        agent_id: 'your_agent_id_here', // You'll need to create an agent in ElevenLabs
        message: systemPrompt,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    })

    if (!response.ok) {
      // Fallback to a simple text generation approach
      console.log('🔄 Falling back to simple text response generation')
      
      // Simple interview response generation
      const interviewResponses = [
        "That's interesting. Can you tell me more about the challenges you faced in that role?",
        "I see. What specific technologies did you work with in that project?",
        "Great! How did you approach problem-solving in that situation?",
        "That sounds like valuable experience. What would you say was your biggest learning from that?",
        "Excellent. Can you walk me through your thought process when tackling complex problems?",
        "I appreciate that insight. How do you stay updated with the latest developments in your field?",
        "That's a good point. What motivates you most in your work?",
        "Interesting perspective. How do you handle working under pressure or tight deadlines?",
        "Thank you for sharing that. What are you looking for in your next role?",
        "I understand. Can you describe a time when you had to learn something completely new quickly?"
      ];
      
      // Select a random appropriate response
      const randomResponse = interviewResponses[Math.floor(Math.random() * interviewResponses.length)];
      
      return new Response(
        JSON.stringify({ response: randomResponse }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const data = await response.json()
    
    console.log('🤖 Generated ElevenLabs AI response')

    return new Response(
      JSON.stringify({ response: data.message || data.response || "Could you please elaborate on that?" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('ElevenLabs chat error:', error)
    
    // Fallback response
    const fallbackResponse = "I see. Could you tell me more about your experience with that?"
    
    return new Response(
      JSON.stringify({ response: fallbackResponse }),
      {
        status: 200, // Return 200 with fallback instead of error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})