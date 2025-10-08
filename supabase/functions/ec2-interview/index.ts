import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

      if (cvError) {
        console.error('❌ Error downloading CV:', cvError);
        throw new Error(`Failed to download CV: ${cvError.message}`);
      }

      // Download JD from Supabase storage
      const { data: jdData, error: jdError } = await supabase.storage
        .from('interview-jds')
        .download(jdFilePath);

      if (jdError) {
        console.error('❌ Error downloading JD:', jdError);
        throw new Error(`Failed to download JD: ${jdError.message}`);
      }

      // Create FormData for EC2 /init_interview
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('cv', cvData, cvFilePath.split('/').pop() || 'cv.pdf');
      formData.append('jd', jdData, jdFilePath.split('/').pop() || 'jd.pdf');

      console.log('📤 Sending init_interview request to EC2...');
      
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
