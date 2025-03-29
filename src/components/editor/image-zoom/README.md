
# Image Zoom Components

This directory contains components for handling zoomable and pannable images in the children's book editor.

## Files

- `ZoomableImage.tsx`: Main component that renders a zoomable and pannable image.
- `ZoomControls.tsx`: Controls component for zoom, pan, and fit operations.
- `useZoomableImage.ts`: Custom hook that contains the logic for image zooming and panning.
- `types.ts`: TypeScript interfaces used by the components in this directory.
- `index.ts`: Barrel export file for easy importing.

## Usage

Import the `ZoomableImage` component to display an image with zoom and pan capabilities:

```tsx
import { ZoomableImage } from '@/components/editor/image-zoom';

function MyComponent() {
  return (
    <ZoomableImage 
      src="/path/to/image.jpg" 
      alt="Description of image"
      initialSettings={{
        scale: 1,
        position: { x: 0, y: 0 },
        fitMethod: 'contain'
      }}
      onSettingsChange={(settings) => {
        // Handle settings changes
      }}
    />
  );
}
```

The component handles all zoom and pan interactions, saving states, and provides a clean UI for users to interact with images.
