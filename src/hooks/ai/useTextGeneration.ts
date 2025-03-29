
import { useState } from 'react';
import { BookPage } from '@/types/book';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTextGeneration() {
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  const generateText = async (prompt: string, temperature: number = 0.7, maxTokens: number = 800): Promise<string | null> => {
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

  const handleApplyAIText = async (
    text: string,
    currentPageData: BookPage | null,
    updatePage: (page: BookPage) => void,
    onAddPage?: () => Promise<void>
  ) => {
    if (!currentPageData) return;
    
    // Define the page break marker
    const pageBreakMarker = '---PAGE BREAK---';
    
    // Split the text by page break markers
    const segments = text.split(pageBreakMarker)
      .map(segment => segment.trim())
      .filter(segment => segment.length > 0);
    
    if (segments.length === 0) {
      toast.error('No valid content found in the generated text');
      return;
    }
    
    try {
      // Store the original page to update
      const originalPage = { ...currentPageData };
      
      // Update the original page with the first segment
      const updatedFirstPage = { ...originalPage, text: segments[0] };
      updatePage(updatedFirstPage);
      
      // If there are more segments and we have an onAddPage function, create additional pages
      if (segments.length > 1 && onAddPage) {
        toast.info(`Creating ${segments.length - 1} additional pages...`);
        
        // Array to store the IDs of created pages
        const createdPages = [];
        
        // Create new pages for each additional segment
        for (let i = 1; i < segments.length; i++) {
          // Create a new page
          await onAddPage();
          
          // Store that we created a page (we'll update it later)
          createdPages.push(i);
        }
        
        toast.success(`Created ${segments.length} pages in total`);
      }
    } catch (error) {
      console.error('Error applying AI text:', error);
      toast.error('Failed to create all pages', {
        description: 'Some pages may not have been created correctly'
      });
    }
  };

  return {
    isGeneratingText,
    generatedText,
    setGeneratedText,
    generateText,
    handleApplyAIText
  };
}
