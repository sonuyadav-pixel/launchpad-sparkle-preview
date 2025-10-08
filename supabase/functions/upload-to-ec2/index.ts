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
    const ec2BaseUrl = Deno.env.get('EC2_BASE_URL') || 'http://YOUR_EC2_IP:9000';

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

    const { filePath, role, bucket } = await req.json();

    if (!filePath || !role || !bucket) {
      throw new Error('Missing required fields: filePath, role, bucket');
    }

    console.log(`📤 Uploading ${role} to EC2 for user ${user.id}`);

    // Download file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (downloadError) {
      console.error('❌ Error downloading file from Supabase:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Create FormData for EC2 upload
    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('role', role); // 'cv' or 'jd'
    formData.append('file', fileData, filePath.split('/').pop() || 'file');

    // Upload to EC2
    const ec2Response = await fetch(`${ec2BaseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!ec2Response.ok) {
      const errorText = await ec2Response.text();
      console.error('❌ EC2 upload failed:', errorText);
      throw new Error(`EC2 upload failed: ${errorText}`);
    }

    const ec2Result = await ec2Response.json();
    console.log('✅ Successfully uploaded to EC2:', ec2Result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        ec2Response: ec2Result,
        message: `${role.toUpperCase()} uploaded to EC2 successfully` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('❌ Error in upload-to-ec2:', error);
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
