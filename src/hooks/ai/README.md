
## AI Hooks Directory

This directory contains hooks for interacting with AI services and managing AI-generated content.

### Files

- `useAITextGeneration.ts`: Manages text generation using AI, including state management for generation status and results.
- `useAIImageGeneration.ts`: Manages image generation using AI, including state management for generation status and results.
- `usePageContentApplier.ts`: Applies AI-generated content to book pages, handling text distribution and image application.

### Instructions

- Use these hooks to separate concerns when working with AI features:
  - Text generation
  - Image generation
  - Applying AI content to book pages

### Dependencies

- Supabase Edge Functions: These hooks rely on Supabase Edge Functions for AI processing
- Toast notifications: User feedback is provided via toast notifications

### Notes

- Error handling is provided for all AI operations
- For multi-page text generation, the page break marker is "---PAGE BREAK---"
- The hooks maintain separation of concerns while preserving the original API
