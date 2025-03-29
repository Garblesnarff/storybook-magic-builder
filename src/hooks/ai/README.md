
# AI Hooks Directory

This directory contains hooks related to AI operations in the application.

### Files

- `useImageGeneration.ts`: Manages image generation operations using AI
- `useTextGeneration.ts`: Manages text generation operations using AI
- `useGeneratedContent.ts`: Manages state for generated content (text and images)
- `useAIOperations.ts`: Main hook that combines all AI-related hooks

### Dependencies

- Uses Supabase for API calls to AI services
- Relies on toast notifications for user feedback

### Notes

- AI operations are designed to work with book pages
- All operations handle loading states and error feedback
