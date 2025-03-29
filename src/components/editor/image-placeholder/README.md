
# Image Placeholder Components

This directory contains components related to the image placeholder functionality in the book editor.

## Files

- `ImagePlaceholder.tsx`: Main component that displays when an image hasn't been generated yet
- `GenerateButton.tsx`: Button component for triggering image generation with loading state
- `index.ts`: Barrel export file for easy importing

## Usage

Import the `ImagePlaceholder` component to show a placeholder where an image will eventually be:

```tsx
import { ImagePlaceholder } from '@/components/editor/image-placeholder';

function MyComponent() {
  return (
    <ImagePlaceholder
      isGenerating={isGenerating}
      onGenerate={handleGenerateImage}
    />
  );
}
```

## Props

- `isGenerating` (boolean): Indicates whether an image is currently being generated
- `onGenerate` (function): Callback function to trigger image generation when the button is clicked
