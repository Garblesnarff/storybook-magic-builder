
# Image Placeholder Components

This directory contains components for displaying placeholders when an image hasn't been generated yet.

### Files

- `GenerateButton.tsx`: Button component for triggering image generation.
- `ImagePlaceholder.tsx`: Component that shows a placeholder UI when no image is available and provides options for generating one.
- `index.ts`: Export file to simplify imports.

### Usage

```tsx
import { ImagePlaceholder } from '@/components/editor/image-placeholder';

// In a component
<ImagePlaceholder
  isGenerating={isLoading}
  onGenerate={handleGenerateImage}
/>
```

The `ImagePlaceholder` will display an icon and a button to generate an image. It shows a loading state when `isGenerating` is true.
