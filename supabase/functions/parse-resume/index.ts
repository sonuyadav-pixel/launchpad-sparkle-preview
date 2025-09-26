import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResumeParseRequest {
  fileUrl: string;
  fileName: string;
  filePath: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting parse-resume function');
    console.log('Method:', req.method);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    if (req.method === 'POST') {
      const requestBody: ResumeParseRequest = await req.json();
      console.log('Request body:', requestBody);

      const { fileUrl, fileName, filePath } = requestBody;

      if (!fileUrl) {
        return new Response(
          JSON.stringify({ error: 'File URL is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get API key from environment
      const apiKey = Deno.env.get('RESUME_PARSER_API_KEY');
      if (!apiKey) {
        console.error('Resume parser API key not found');
        return new Response(
          JSON.stringify({ error: 'Resume parser API key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        console.log('Calling resume parser API with URL:', fileUrl);
        
        // Call the resume parser API
        const parseResponse = await fetch(`https://api.apilayer.com/resume_parser/url?url=${encodeURIComponent(fileUrl)}`, {
          method: 'GET',
          headers: {
            'apikey': apiKey
          }
        });

        if (!parseResponse.ok) {
          console.error('Resume parser API error:', parseResponse.status, parseResponse.statusText);
          const errorText = await parseResponse.text();
          console.error('Error response:', errorText);
          
          return new Response(
            JSON.stringify({ error: 'Failed to parse resume', details: errorText }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const parsedData = await parseResponse.json();
        console.log('Parsed resume data:', parsedData);

        // Save parsed data to database
        const { data: savedResume, error: saveError } = await supabase
          .from('parsed_resumes')
          .insert({
            user_id: user.id,
            file_path: filePath,
            file_name: fileName,
            parsed_data: parsedData
          })
          .select()
          .single();

        if (saveError) {
          console.error('Error saving parsed resume:', saveError);
          return new Response(
            JSON.stringify({ error: 'Failed to save parsed resume data' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Successfully saved parsed resume:', savedResume.id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: savedResume,
            parsedData: parsedData 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      } catch (parseError) {
        console.error('Error parsing resume:', parseError);
        return new Response(
          JSON.stringify({ error: 'Failed to parse resume', details: parseError instanceof Error ? parseError.message : 'Unknown error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});