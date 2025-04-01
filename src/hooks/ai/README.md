
# AI Assistant Hooks

This directory contains hooks related to AI functionality in the Children's Book Generator application.

## Files

- `useAITextGeneration.ts`: Hook for generating text content using AI.
- `useAIImageGeneration.ts`: Hook for generating images based on text prompts.
- `usePageContentApplier.ts`: Hook for applying generated AI content to book pages.
- `useNarration.ts`: Hook for generating audio narrations of book content.

## Style Integration

The image generation system now uses the selected style to create more accurate illustrations:

1. Each style (CARTOON, WATERCOLOR, etc.) has a detailed description for the AI prompt
2. Styles are stored in user preferences and applied consistently
3. The default style can be configured in the Settings page

## Dependencies

- These hooks use the Supabase edge functions for AI operations
- They rely on toast notifications for user feedback
- They integrate with the book/page data management system

