
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
            content: `You are a helpful children's book assistant. Write creative, engaging, and age-appropriate content for children's books based on user prompts.

When asked to create a story:
1. Create engaging, child-friendly content divided into logical pages.
2. When a new page should begin, insert the marker "---PAGE BREAK---" on its own line.
3. Each page should contain approximately 1-3 paragraphs (50-100 words).
4. Create natural page transitions that make sense for a children's book.
5. Aim for 3-7 pages total, depending on the story complexity.
6. Each page should have enough content to pair with a single illustration.
7. Do not include any numbering, titles, or "Page X" markers - just the story text and page break markers.`
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
