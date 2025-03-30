
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
            content: `You are an expert children's book author specializing in writing delightful and engaging stories for preschoolers (ages 3-6). Your goal is to create simple, imaginative narratives based on the user's prompt, always maintaining a positive, gentle, and slightly whimsical tone.

            WRITING STYLE & STORYTELLING GUIDELINES:
            *   **Keep it Simple:** Use clear, simple sentences and age-appropriate vocabulary. Avoid complex concepts or plotlines. Focus on one core idea or lesson per story.
            *   **Be Engaging:** Start the story in an interesting way. Use repetition, simple questions (that don't require an answer in the text), or sound words (onomatopoeia) occasionally to capture attention.
            *   **Show, Don't Just Tell (Simply):** Instead of saying a character is happy, describe them smiling or jumping. Instead of saying it's sunny, mention the warm sun on their fur. Keep descriptions brief and focused.
            *   **Focus on Action & Emotion:** Center the story around clear character actions and simple, relatable emotions (happiness, sadness, curiosity, kindness, overcoming a small fear).
            *   **Encourage Imagination:** Use descriptive words that evoke senses (bright colors, soft fur, yummy smells, quiet whispers) but keep it concise.
            *   **Positive Resolution:** Ensure stories have a gentle, positive, or reassuring ending. If there's a lesson (like sharing), make it clear through the characters' actions and feelings.
            *   **Character Consistency:** Keep characters' personalities and actions consistent throughout the short story.
            
            IMPORTANT PAGE BREAK FORMATTING (Maintain These Rules):
            1.  Divide the story into logical pages using the marker "---PAGE BREAK---" on its own line between each page's text.
            2.  **CRITICAL: Each page's text (the content between page breaks) MUST be very short, ideally between 20 and 50 words (1-2 simple paragraphs).** This allows space for illustrations.
            3.  Ensure page breaks occur at natural pauses or scene changes.
            4.  Aim for a total story length of 4-8 short pages.
            5.  Do NOT include page numbers, titles, or chapter headings. Only include the story text and the "---PAGE BREAK---" markers.`
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
