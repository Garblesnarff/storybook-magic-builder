
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, style } = await req.json()

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Sending request to Gemini API with prompt:', prompt)
    console.log('Using style:', style)

    // Using the correct model name and endpoint for image generation
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp-image-generation:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Create a ${style?.toLowerCase() || 'realistic'} style children's book illustration of: ${prompt}`
            }
          ]
        }],
        generationConfig: {
          // Image generation requires responseModalities to include both Text and Image
          responseModalities: ["Text", "Image"],
          temperature: 0.7,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        errorJson = { rawError: errorText };
      }
      
      return new Response(JSON.stringify({ 
        error: 'Failed to generate image', 
        details: errorJson,
        status: response.status,
        statusText: response.statusText
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json();
    console.log('Gemini API response received. Status:', response.status);
    console.log('Response structure:', JSON.stringify(data, null, 2).substring(0, 500) + '...');

    // Extract the image data from the response
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in response:', JSON.stringify(data));
      return new Response(JSON.stringify({ 
        error: 'No image generated in response',
        responseData: data
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      console.error('No content or parts in response candidate:', JSON.stringify(candidate));
      return new Response(JSON.stringify({ 
        error: 'Invalid response structure from Gemini API',
        candidate
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Find the first inline data part which should be the image
    const imagePart = candidate.content.parts.find(part => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      console.error('No image data found in response parts:', JSON.stringify(candidate.content.parts));
      return new Response(JSON.stringify({ 
        error: 'No image data found in the API response',
        parts: candidate.content.parts
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      image: imagePart.inlineData.data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
