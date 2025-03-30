
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
// Define a default voice ID (e.g., 'pNInz6obpgDQGcFmaJgB' for 'Adam')
const DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB"; 
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`;

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!ELEVENLABS_API_KEY) {
    console.error("ElevenLabs API key not set.");
    return new Response(JSON.stringify({ error: "Server configuration error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return new Response(JSON.stringify({ error: "Text content is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Requesting narration for text: "${text.substring(0, 50)}..."`);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
        "Accept": "audio/mpeg", // Request MP3 audio
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2", // Or your preferred model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`ElevenLabs API Error (${response.status}):`, errorBody);
      return new Response(JSON.stringify({ error: `Failed to generate audio (${response.status})`, details: errorBody }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the audio data as an ArrayBuffer
    const audioArrayBuffer = await response.arrayBuffer();
    // Convert ArrayBuffer to Base64 string to send back via JSON
    const base64Audio = btoa(
      new Uint8Array(audioArrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    console.log("Narration generated successfully.");

    return new Response(JSON.stringify({ audioBase64: base64Audio }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-narration function:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
