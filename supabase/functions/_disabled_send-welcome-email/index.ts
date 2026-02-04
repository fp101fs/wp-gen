import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { email, name, user_id } = await req.json()
    
    console.log('🎉 New user signup detected - sending welcome email:', { email, user_id })

    // Call the existing welcome email API
    const response = await fetch(`${Deno.env.get('SITE_URL')}/api/send-welcome-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Welcome email failed:', errorText)
      throw new Error(`Welcome email API failed: ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Welcome email sent successfully via trigger:', result.emailId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Welcome email sent successfully',
        emailId: result.emailId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('💥 Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})