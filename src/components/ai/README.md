
# AI Components Directory

This directory contains components used for AI-powered features in the Children's Book Generator application.

### Files

- `PromptInput.tsx`: A reusable component for users to input prompts for AI generation.
- `TextGenerationTab.tsx`: Component for text generation controls and display of generated text.
- `ImageGenerationTab.tsx`: Component for image generation controls and display of generated images.
- `AIAssistantTabs.tsx`: Component that manages the tabs interface for switching between text and image generation.

### Dependencies

- Uses the `useAIOperations` hook for backend API operations
- Leverages Shadcn UI components for consistent UI design

### Usage

These components are primarily used within the `AIAssistant` component to provide an intuitive interface for generating text and images for children's books using AI.
