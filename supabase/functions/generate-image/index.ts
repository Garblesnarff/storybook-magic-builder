
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
    console.log("Image generation function called")
    
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request format",
          details: "Could not parse request body as JSON"
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { prompt, style } = requestData;
    
    // Validate required parameters
    if (!prompt) {
      console.error("Missing prompt in request");
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameter",
          details: "Prompt is required" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for API key
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable not set');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          details: 'API key not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the style description based on the style ID
    const styleDescription = STYLE_DESCRIPTIONS[style] || STYLE_DESCRIPTIONS['REALISTIC'];
    
    console.log(`Processing image generation request with prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`)
    console.log(`Using style: ${style || 'default'} (${styleDescription})`)

    // Use the correct beta API endpoint for image generation
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent`;
    
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
    };
    
    console.log(`Sending image generation request to Gemini API endpoint: ${url}`);
    
    // Log the request body for debugging
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    // Make the request to Gemini API with the key as a query parameter
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Gemini API response status:', response.status);
    console.log('Gemini API response status text:', response.statusText);
    
    const responseHeaders = Object.fromEntries([...response.headers]);
    console.log('Gemini API response headers:', JSON.stringify(responseHeaders, null, 2));

    // Handle API error responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response status:', response.status);
      console.error('Gemini API error response text:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error('Parsed Gemini API error:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.error('Failed to parse error response as JSON:', e);
        errorData = { error: { message: errorText } };
      }
      
      // Extract error details
      const errorCode = errorData.error?.code || response.status;
      const errorMessage = errorData.error?.message || 
                          errorData.error?.details || 
                          errorData.message || 
                          'Failed to generate image with Gemini API';
      
      console.error(`Gemini API error ${errorCode}: ${errorMessage}`);
      
      // Return a structured error response
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate image', 
          details: errorMessage,
          code: errorCode,
          rawResponse: errorData
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Process the successful response
    const data = await response.json();
    console.log('Gemini API response received');
    
    // Log the response structure for debugging
    console.log('Response structure:', JSON.stringify(Object.keys(data), null, 2));
    
    if (data.candidates && data.candidates.length > 0) {
      console.log('Found candidates in response');
      
      if (data.candidates[0].content) {
        console.log('Content structure:', JSON.stringify(Object.keys(data.candidates[0].content), null, 2));
        
        if (data.candidates[0].content.parts) {
          console.log('Parts count:', data.candidates[0].content.parts.length);
          console.log('Parts types:', data.candidates[0].content.parts.map(part => 
            Object.keys(part).join(', ')
          ));
        }
      }
    } else {
      console.log('No candidates found in response');
      console.log('Full response:', JSON.stringify(data, null, 2));
    }
    
    // Extract the image data from the response
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts;
      
      for (const part of parts) {
        // Check for inline data which would contain the image
        if (part.inlineData) {
          console.log('Image data found successfully');
          
          // Return just the base64 data for compatibility with existing frontend
          return new Response(
            JSON.stringify({ 
              image: part.inlineData.data
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
    }
    
    // If no image was found in the response
    console.log('No image found in Gemini response');
    console.log('Full response structure:', JSON.stringify(data, null, 2));
    
    return new Response(
      JSON.stringify({ 
        error: 'No image data found in the API response',
        rawResponse: data
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (err) {
    // Handle any unexpected errors
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Unexpected error in generate-image function:`, errorMessage);
    console.error('Error details:', err);
    
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
    );
  }
})
