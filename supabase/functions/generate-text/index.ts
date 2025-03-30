
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
    const { prompt, temperature = 0.7, maxTokens = 800 } = await req.json()
    
    // Validate request parameters
    if (!prompt || prompt.trim() === '') {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      console.error('Groq API key is not configured')
      return new Response(JSON.stringify({ error: 'Groq API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Sending request to Groq API with prompt: "${prompt.substring(0, 50)}..."`)
    console.log(`Using temperature: ${temperature} and max_tokens: ${maxTokens}`)

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a helpful children's book assistant specializing in writing engaging stories for young children (ages 3-6). Write creative, simple, and age-appropriate content based on the user's prompt, always maintaining a positive and gentle tone.

IMPORTANT STORY & PAGE BREAK FORMATTING:
1. Create a simple, engaging story suitable for preschoolers.
2. Divide the story into logical pages using the marker "---PAGE BREAK---" on its own line between each page's text.
3. **CRITICAL: Each page's text (the content between page breaks) MUST be very short, ideally between 20 and 50 words (1-2 simple paragraphs, suitable for a preschooler).** This is essential so the text fits alongside an illustration.
4. Ensure page breaks occur at natural pauses or scene changes in the story.
5. Aim for a total story length of 4-8 short pages.
6. Do NOT include any page numbers, titles like "Page X", or chapter headings. Only include the story text and the "---PAGE BREAK---" markers.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: maxTokens
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Groq API error response:', errorData)
      return new Response(JSON.stringify({ 
        error: errorData.error?.message || 'Error calling Groq API',
        status: response.status,
        statusText: response.statusText
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    console.log('Groq API response received successfully')

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected response format from Groq API:', data)
      return new Response(JSON.stringify({ error: 'Invalid response from Groq API' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      text: data.choices[0].message.content,
      model: data.model || 'llama-3.3-70b-versatile'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error generating text:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
