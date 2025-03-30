
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const VOICE_ID = "lxYfHSkYm1EzQzGhdbfc"; // Updated to use the specified voice ID
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

serve(async (req) => {
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

    console.log(`Generating narration with voice ID: ${VOICE_ID} for text: "${text.substring(0, 50)}..."`);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
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

    const audioArrayBuffer = await response.arrayBuffer();
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
