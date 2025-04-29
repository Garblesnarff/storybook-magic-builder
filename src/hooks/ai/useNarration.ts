
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uploadAudio } from '@/services/supabase/storage';
import { toast } from 'sonner';

// Helper to convert Base64 to Blob
function base64ToBlob(base64: string, contentType: string = 'audio/mpeg'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

export function useNarration() {
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationError, setNarrationError] = useState<string | null>(null);

  const generateNarration = useCallback(async (text: string, bookId: string, pageId: string): Promise<string | null> => {
    if (!text || !bookId || !pageId) {
      const errorMsg = `Missing required information for narration: ${!text ? 'text' : !bookId ? 'bookId' : 'pageId'}`;
      console.error(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    setIsNarrating(true);
    setNarrationError(null);
    const toastId = toast.loading("Generating narration...");

    try {
      console.log("Generating narration with parameters:", { 
        textLength: text.length,
        bookId,
        pageId
      });

      // 1. Call the Edge Function
      const { data: funcData, error: funcError } = await supabase.functions.invoke('generate-narration', {
        body: JSON.stringify({ text }),
      });

      if (funcError || !funcData?.audioBase64) {
        const errorMsg = funcError?.message || funcData?.error || "Failed to get audio data from function.";
        console.error('Narration function error:', funcError || funcData?.error);
        toast.error("Narration Generation Failed", { id: toastId, description: errorMsg });
        setNarrationError(errorMsg);
        return null;
      }

      // 2. Convert Base64 to Blob
      const audioBlob = base64ToBlob(funcData.audioBase64);

      // 3. Upload Blob to Supabase Storage
      toast.loading("Uploading narration...", { id: toastId });
      const publicUrl = await uploadAudio(audioBlob, bookId, pageId);

      if (!publicUrl) {
        // uploadAudio already shows a toast on failure
        setNarrationError("Failed to upload audio.");
        toast.error("Narration Upload Failed", { id: toastId, description: "Could not save the generated audio." });
        return null;
      }

      // 4. Success
      toast.success("Narration Ready!", { id: toastId, duration: 3000 });
      return publicUrl; // Return the URL to be saved

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      console.error("Error in generateNarration hook:", err);
      setNarrationError(err.message);
      toast.error("Narration Failed", { id: toastId, description: err.message });
      return null;
    } finally {
      setIsNarrating(false);
    }
  }, []); // Empty dependency array is correct

  return {
    isNarrating,
    narrationError,
    generateNarration,
  };
}
