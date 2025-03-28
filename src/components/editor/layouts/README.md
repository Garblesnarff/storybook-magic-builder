
# Editor Layouts Directory

This directory contains layout components used in the book editor to display different page layouts.

### Files

- `TextLeftImageRight.tsx`: Layout component with text on the left side and image on the right side
- `ImageLeftTextRight.tsx`: Layout component with image on the left side and text on the right side
- `TextTopImageBottom.tsx`: Layout component with text on the top and image on the bottom
- `ImageTopTextBottom.tsx`: Layout component with image on the top and text on the bottom
- `FullPageImage.tsx`: Layout component with a full-page image and text overlay at the bottom
- `FullPageText.tsx`: Layout component with only text, no image
- `EmptyPagePlaceholder.tsx`: Component displayed when no page is selected
- `index.ts`: Exports all layout components for easier imports

### Instructions

- Each layout component receives the current page data and handlers for generating images
- All image-containing layouts use the ImagePlaceholder component when no image is present
- The ImagePlaceholder component provides consistent UI for image generation across all layouts
- All layouts with images support zoom and pan functionality through the ZoomableImage component

### Dependencies

- The ZoomableImage component for all layouts that include images
- The ImagePlaceholder component for displaying image generation UI
- Lucide React for icons
- UI components from shadcn/ui

