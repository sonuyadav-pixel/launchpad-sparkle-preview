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
    return text.slice(0, 2000); // Fallback to first 2000 chars
  }

  const prompt = type === 'cv' 
    ? `Summarize this CV/Resume comprehensively, including: candidate's name, key skills, work experience highlights, education, and notable achievements. Keep it detailed but concise (max 500 words):\n\n${text}`
    : `Summarize this Job Description comprehensively, including: job title, key responsibilities, required skills and qualifications, experience requirements, and important role details. Keep it detailed but concise (max 500 words):\n\n${text}`;

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
      console.error('AI summarization failed:', await response.text());
      return text.slice(0, 2000); // Fallback
    }

    const data = await response.json();
    return data.choices[0].message.content || text.slice(0, 2000);
  } catch (error) {
    console.error('Error summarizing document:', error);
    return text.slice(0, 2000); // Fallback
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ec2BaseUrl = Deno.env.get('EC2_BASE_URL') || 'http://34.224.102.49:9000';

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

    const { action, userId, cvFilePath, jdFilePath, answer } = await req.json();

    console.log(`📡 EC2 Interview Action: ${action} for user ${userId}`);

    // Handle init_interview action
    if (action === 'init') {
      if (!cvFilePath || !jdFilePath) {
        throw new Error('Missing CV or JD file paths for initialization');
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

      // Convert Blobs to text (assuming text-based files)
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

      // Create FormData with summaries as text
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('cv', cvSummary);
      formData.append('jd', jdSummary);

      console.log('📤 Sending init_interview request to EC2 with summaries');
      
      const ec2Response = await fetch(`${ec2BaseUrl}/init_interview`, {
        method: 'POST',
        body: formData,
      });

      if (!ec2Response.ok) {
        const errorText = await ec2Response.text();
        console.error('❌ EC2 init_interview failed:', errorText);
        throw new Error(`EC2 init_interview failed: ${errorText}`);
      }

      const result = await ec2Response.json();
      console.log('✅ EC2 init_interview response:', result);

      return new Response(
        JSON.stringify({ 
          success: true,
          question: result.question || result.response || 'Hello! Please introduce yourself.',
          message: 'Interview initialized successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Handle next question action
    if (action === 'next') {
      if (!answer) {
        throw new Error('Missing answer for next question');
      }

      // Create FormData for EC2 /next
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('answer', answer);

      console.log('📤 Sending next question request to EC2...');
      
      const ec2Response = await fetch(`${ec2BaseUrl}/next`, {
        method: 'POST',
        body: formData,
      });

      if (!ec2Response.ok) {
        const errorText = await ec2Response.text();
        console.error('❌ EC2 next failed:', errorText);
        throw new Error(`EC2 next failed: ${errorText}`);
      }

      const result = await ec2Response.json();
      console.log('✅ EC2 next response:', result);

      const question = result.question || result.response || '';
      const isComplete = question.toLowerCase().includes('thank you for the interview');

      return new Response(
        JSON.stringify({ 
          success: true,
          question: question,
          isComplete: isComplete,
          message: 'Next question retrieved successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    throw new Error('Invalid action. Must be "init" or "next"');

  } catch (error: any) {
    console.error('❌ Error in ec2-interview:', error);
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
