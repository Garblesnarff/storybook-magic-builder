
# ImagePlaceholder Component

This component displays a placeholder when an image hasn't been generated yet, along with a button to generate an image.

## Props

- `isGenerating` (boolean): Indicates whether an image is currently being generated
- `onGenerate` (function): Callback function to trigger image generation when the button is clicked

## Usage

```tsx
import { ImagePlaceholder } from '@/components/editor/ImagePlaceholder';

// Inside your component
<ImagePlaceholder
  isGenerating={isGenerating}
  onGenerate={handleGenerateImage}
/>
```

## Dependencies

- shadcn/ui Button component
- Lucide React icons (Sparkles, Image, Loader2)
