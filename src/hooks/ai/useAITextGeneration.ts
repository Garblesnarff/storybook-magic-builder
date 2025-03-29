
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAITextGeneration() {
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  const generateText = async (prompt: string, temperature: number = 0.7, maxTokens: number = 800) => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return null;
    }

    setIsGeneratingText(true);
    setGeneratedText('');

    try {
      // Enhance the prompt with instructions for page breaks
      const enhancedPrompt = `
Create a children's story based on the following prompt: "${prompt}"

IMPORTANT FORMATTING INSTRUCTIONS:
1. When you want to indicate a new page in the book, insert the marker "---PAGE BREAK---" on a separate line.
2. Place these markers at natural transition points in the story.
3. Each page should contain approximately 1-3 paragraphs of text.
4. The story should have 3-7 pages total, depending on its complexity.
5. Do not include any numbering, titles, or "Page X" markers - just the story text and page break markers.
`;

      const response = await supabase.functions.invoke('generate-text', {
        body: JSON.stringify({ 
          prompt: enhancedPrompt, 
          temperature,
          maxTokens: Math.max(maxTokens, 1500) // Ensure we have enough tokens for multi-page stories
        })
      });

      if (response.error) {
        toast.error('Text generation failed', {
          description: response.error.message
        });
        console.error('Text generation error:', response.error);
        return null;
      }

      setGeneratedText(response.data.text);
      toast.success('Text generated successfully!');
      return response.data.text;
    } catch (error) {
      console.error('Text generation error:', error);
      toast.error('Text generation failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    } finally {
      setIsGeneratingText(false);
    }
  };

  return {
    isGeneratingText,
    generatedText,
    setGeneratedText,
    generateText
  };
}
