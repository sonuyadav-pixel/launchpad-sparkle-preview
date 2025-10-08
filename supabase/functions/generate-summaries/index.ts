import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to summarize document using Lovable AI
async function summarizeDocument(text: string, type: 'cv' | 'jd'): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.warn('LOVABLE_API_KEY not found, returning truncated text');
    return text.slice(0, 300);
  }

  // Truncate text to prevent API size limits (max 5000 chars is enough for good summary)
  const truncatedText = text.slice(0, 5000);

  const prompt = type === 'cv' 
    ? `Summarize this CV/Resume in max 50 words. Include: candidate's name, top 2-3 skills, current role, years of experience:\n\n${truncatedText}`
    : `Summarize this Job Description in max 50 words. Include: job title, 2-3 key requirements, experience level needed:\n\n${truncatedText}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a document summarization assistant. Create comprehensive yet concise summaries.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI summarization failed:', errorText);
      return truncatedText.slice(0, 300);
    }

    const data = await response.json();
    return data.choices[0].message.content || truncatedText.slice(0, 300);
  } catch (error) {
    console.error('Error summarizing document:', error);
    return truncatedText.slice(0, 300);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    const { scheduledInterviewId, cvFilePath, jdFilePath } = await req.json();

    console.log(`📋 Generating summaries for scheduled interview: ${scheduledInterviewId}`);

    if (!cvFilePath || !jdFilePath) {
      throw new Error('Missing CV or JD file paths');
    }

    // Download CV from Supabase storage
    const { data: cvData, error: cvError } = await supabase.storage
      .from('interview-cvs')
      .download(cvFilePath);

    if (cvError || !cvData) {
      console.error('❌ Error downloading CV:', cvError);
      throw new Error(`Failed to download CV: ${cvError?.message || 'No data'}`);
    }

    // Download JD from Supabase storage
    const { data: jdData, error: jdError } = await supabase.storage
      .from('interview-jds')
      .download(jdFilePath);

    if (jdError || !jdData) {
      console.error('❌ Error downloading JD:', jdError);
      throw new Error(`Failed to download JD: ${jdError?.message || 'No data'}`);
    }

    // Convert Blobs to text
    const cvText = await cvData.text();
    const jdText = await jdData.text();

    console.log('📄 Document lengths - CV:', cvText.length, 'JD:', jdText.length);

    // Summarize both documents using AI
    console.log('🤖 Summarizing CV and JD...');
    const [cvSummary, jdSummary] = await Promise.all([
      summarizeDocument(cvText, 'cv'),
      summarizeDocument(jdText, 'jd')
    ]);

    console.log('✅ Summaries generated - CV:', cvSummary.length, 'chars, JD:', jdSummary.length, 'chars');

    // Store summaries in the scheduled_interviews table
    const { error: updateError } = await supabase
      .from('scheduled_interviews')
      .update({
        cv_summary: cvSummary,
        jd_summary: jdSummary
      })
      .eq('id', scheduledInterviewId);

    if (updateError) {
      console.error('❌ Error storing summaries:', updateError);
      throw new Error(`Failed to store summaries: ${updateError.message}`);
    }

    console.log('✅ Summaries stored successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        cv_summary: cvSummary,
        jd_summary: jdSummary,
        message: 'Summaries generated and stored successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('❌ Error in generate-summaries:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
