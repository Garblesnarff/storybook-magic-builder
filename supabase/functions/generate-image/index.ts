
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
    console.log('Using style:', style || 'REALISTIC')

    // Updated request format for image generation based on Gemini documentation
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent', {
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

    // Extract the text that describes the image (Gemini Pro Vision doesn't directly return images)
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in response:', JSON.stringify(data));
      return new Response(JSON.stringify({ 
        error: 'No content generated in response',
        responseData: data
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Using a different approach - we'll now call a different API to generate the image
    // based on the text description from Gemini
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

    const textPart = candidate.content.parts.find(part => part.text);
    if (!textPart || !textPart.text) {
      console.error('No text found in response parts:', JSON.stringify(candidate.content.parts));
      return new Response(JSON.stringify({ 
        error: 'No text description found in the API response',
        parts: candidate.content.parts
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Now use Stability AI API to generate the actual image from the description
    // This is a fallback since we're having issues with direct image generation from Gemini
    const stabilityApiKey = Deno.env.get('STABILITY_API_KEY');
    if (!stabilityApiKey) {
      // If no Stability API key, return the text description instead
      return new Response(JSON.stringify({ 
        textDescription: textPart.text,
        note: "Image generation requires a Stability AI API key."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Call Stability AI for actual image generation
    const stabilityResponse = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${stabilityApiKey}`
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: textPart.text,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30
      })
    });

    if (!stabilityResponse.ok) {
      const stabilityError = await stabilityResponse.text();
      console.error('Stability API error:', stabilityError);
      
      // Fall back to returning just the text description
      return new Response(JSON.stringify({ 
        textDescription: textPart.text,
        error: 'Failed to generate image with Stability AI',
        stabilityError
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const stabilityData = await stabilityResponse.json();
    if (!stabilityData.artifacts || stabilityData.artifacts.length === 0) {
      return new Response(JSON.stringify({ 
        textDescription: textPart.text,
        error: 'No image generated by Stability AI'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return the base64 image data
    return new Response(JSON.stringify({ 
      image: stabilityData.artifacts[0].base64
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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
