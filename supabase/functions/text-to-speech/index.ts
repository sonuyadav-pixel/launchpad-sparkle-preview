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
    const { text, voice } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    console.log('Converting text to speech with ElevenLabs:', text.substring(0, 50) + '...')
    console.log('Using voice:', voice || 'alloy')

    // Get ElevenLabs API key
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    // Voice mapping - use voice IDs from ElevenLabs
    const voiceMapping = {
      'alloy': '9BWtsMINqrJLrRacOk9x', // Aria
      'echo': 'CwhRBWXzGAHq8TQ4Fs17', // Roger  
      'fable': 'EXAVITQu4vr4xnSDxMaL', // Sarah
      'onyx': 'JBFqnCBsd6RMkjVDRZzb', // George
      'nova': 'XB0fDUnXU5powFXDhCwa', // Charlotte
      'shimmer': 'pFZP5JQG7iQjIQuC4Bku' // Lily
    }

    const selectedVoiceId = voiceMapping[voice] || '9BWtsMINqrJLrRacOk9x' // Default to Aria

    // Generate speech using ElevenLabs API
    const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    })

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text()
      console.error('ElevenLabs API error:', elevenLabsResponse.status, errorText)
      throw new Error(`ElevenLabs API error: ${elevenLabsResponse.status} ${errorText}`)
    }

    // Convert audio buffer to base64 safely
    const arrayBuffer = await elevenLabsResponse.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Convert to base64 in chunks to avoid call stack overflow
    let base64Audio = ''
    const chunkSize = 8192 // Process in 8KB chunks
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize)
      base64Audio += btoa(String.fromCharCode(...chunk))
    }

    console.log('Successfully generated speech, audio length:', arrayBuffer.byteLength)

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Text-to-speech error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})