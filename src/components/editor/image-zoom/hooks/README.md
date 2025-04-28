
# Image Zoom Hooks

This directory contains hooks for handling zoomable and pannable images in the children's book editor.

## Files

- `useZoomableImage.ts`: Main hook that combines all other hooks to provide a complete zoom and pan experience.
- `useContainerDimensions.ts`: Hook to track the container element's dimensions and update when resized.
- `useImageLoader.ts`: Hook for handling image loading states, including loading, loaded, and error states.
- `useImageFit.ts`: Hook for calculating how to fit an image within a container.
- `useImagePan.ts`: Hook for handling panning interactions with mouse events.
- `useImageZoom.ts`: Hook for handling zoom operations with buttons or wheel events.
- `useSettingsSync.ts`: Hook to sync image settings with parent components.

## Usage

The main hook is `useZoomableImage` which can be used to add zoom and pan capabilities to an image:

```tsx
const {
  scale,
  position,
  fitMethod,
  isPanning,
  imageLoaded,
  isLoading,
  isInteractionReady,
  containerRef,
  imageRef,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleZoomIn,
  handleZoomOut,
  toggleFitMethod,
  handleReset,
  handleImageLoad,
  updateDimensions,
  imageStyle
} = useZoomableImage(imageUrl, initialSettings, onSettingsChange);
```

This hook can be used directly in a component for rendering zoomable images with controls.
