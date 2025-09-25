import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Test function called');
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    return new Response(JSON.stringify({ 
      message: 'Test function is working',
      timestamp: new Date().toISOString(),
      method: req.method
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in test function:', error);
    return new Response(JSON.stringify({ 
      error: error?.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});