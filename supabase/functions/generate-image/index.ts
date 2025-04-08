
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map of style IDs to detailed descriptions for prompts
const STYLE_DESCRIPTIONS: Record<string, string> = {
  'REALISTIC': 'realistic, detailed, photorealistic style',
  'CARTOON': 'cartoon style, animated, colorful, kid-friendly',
  'WATERCOLOR': 'watercolor painting style, soft brushstrokes, artistic',
  'SKETCH': 'pencil sketch style, hand-drawn, detailed linework',
  'ABSTRACT': 'abstract art style, non-representational, colorful shapes',
  'FANTASY': 'fantasy illustration style, magical, whimsical',
  'VINTAGE': 'vintage illustration style, retro, nostalgic'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, style } = await req.json()

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable not set')
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          details: 'API key not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the style description based on the style ID
    const styleDescription = STYLE_DESCRIPTIONS[style] || STYLE_DESCRIPTIONS['REALISTIC'];
    
    console.log(`Processing image generation request with prompt: "${prompt}"`)
    console.log(`Using style: ${style || 'default'} (${styleDescription})`)

    // Use the correct beta API endpoint for image generation
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent`
    
    // Prepare the request with the enhanced style description
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Create a ${styleDescription} children's book illustration of: ${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["Text", "Image"]
      }
    }
    
    console.log(`Sending image generation request to Gemini API endpoint: ${url}`)
    
    // Make the request to Gemini API with the key as a query parameter
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    // Enhanced logging for debugging
    console.log('Gemini API response status:', response.status)
    console.log('Gemini API response status text:', response.statusText)
    
    const responseHeaders = Object.fromEntries([...response.headers])
    console.log('Gemini API response headers:', JSON.stringify(responseHeaders, null, 2))

    // Handle API error responses
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error response status:', response.status)
      console.error('Gemini API error response text:', errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
        console.error('Parsed Gemini API error:', JSON.stringify(errorData, null, 2))
      } catch (e) {
        console.error('Failed to parse error response as JSON:', e)
        errorData = { error: { message: errorText } }
      }
      
      // Detailed error message
      const errorMessage = errorData.error?.message || 
                          errorData.error?.details || 
                          errorData.message || 
                          'Failed to generate image with Gemini API'
      
      console.error(`Gemini API error: ${errorMessage}`)
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate image', 
          details: errorMessage,
          rawResponse: errorData
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Process the successful response
    const data = await response.json()
    console.log('Gemini API response received')
    
    // Log the response structure for debugging
    if (data.candidates && data.candidates.length > 0) {
      console.log('Found candidates in response')
      console.log('Response structure:', JSON.stringify(Object.keys(data), null, 2))
      console.log('Candidates structure:', JSON.stringify(Object.keys(data.candidates[0]), null, 2))
      
      if (data.candidates[0].content) {
        console.log('Content structure:', JSON.stringify(Object.keys(data.candidates[0].content), null, 2))
        
        if (data.candidates[0].content.parts) {
          console.log('Parts count:', data.candidates[0].content.parts.length)
          console.log('Parts structure:', data.candidates[0].content.parts.map(part => 
            Object.keys(part).join(', ')
          ))
        }
      }
    } else {
      console.log('No candidates found in response')
      console.log('Full response:', JSON.stringify(data, null, 2))
    }
    
    // Extract the image data from the response
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts
      
      for (const part of parts) {
        // Check for inline data which would contain the image
        if (part.inlineData) {
          // Return just the base64 data for compatibility with existing frontend
          return new Response(
            JSON.stringify({ 
              image: part.inlineData.data
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      }
    }
    
    // If no image was found in the response
    console.log('No image found in Gemini response')
    return new Response(
      JSON.stringify({ 
        error: 'No image data found in the API response',
        rawResponse: data
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (err) {
    // Handle any unexpected errors
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Unexpected error in generate-image function:`, errorMessage)
    console.error('Error details:', err)
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        details: errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
