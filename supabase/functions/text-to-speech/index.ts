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
    console.log('Using voice:', voice || 'Sarah')

    // Get ElevenLabs API key
    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenlabsApiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    // Voice mapping - ElevenLabs voice IDs
    const voiceMapping = {
      'alloy': 'EXAVITQu4vr4xnSDxMaL', // Sarah
      'echo': 'TX3LPaxmHKxFdv7VOQHJ', // Liam
      'fable': 'XB0fDUnXU5powFXDhCwa', // Charlotte
      'onyx': 'N2lVS1w4EtoT3dr4eOWO', // Callum
      'nova': '9BWtsMINqrJLrRacOk9x', // Aria
      'shimmer': 'pFZP5JQG7iQjIQuC4Bku' // Lily
    }

    const voiceId = voiceMapping[voice as keyof typeof voiceMapping] || 'EXAVITQu4vr4xnSDxMaL'

    // Generate speech using ElevenLabs API
    const elevenlabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': elevenlabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    })

    if (!elevenlabsResponse.ok) {
      const errorText = await elevenlabsResponse.text()
      console.error('ElevenLabs API error:', elevenlabsResponse.status, errorText)
      throw new Error(`ElevenLabs API error: ${elevenlabsResponse.status} ${errorText}`)
    }

    // Convert audio buffer to base64 safely
    const arrayBuffer = await elevenlabsResponse.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Convert the entire buffer to base64 at once
    let binaryString = ''
    const chunkSize = 8192 // Process in 8KB chunks to build binary string
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
      binaryString += String.fromCharCode.apply(null, Array.from(chunk))
    }
    
    // Convert the complete binary string to base64
    const base64Audio = btoa(binaryString)

    console.log('Successfully generated speech with ElevenLabs, audio length:', arrayBuffer.byteLength)

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    console.error('Text-to-speech error:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})