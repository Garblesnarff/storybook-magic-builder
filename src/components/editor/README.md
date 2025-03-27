
# Editor Components Directory

This directory contains components used for the book editor functionality.

### Files

- `EditorHeader.tsx`: Top header component with book title and actions
- `EditorContent.tsx`: Main content wrapper for the editor
- `PageEditor.tsx`: Main page editing component that renders different layouts
- `PageSettings.tsx`: Right sidebar with settings for the current page
- `ZoomableImage.tsx`: Component that provides zoom and pan functionality for images

### Subdirectories

- `layouts/`: Contains different page layout components, see layouts/README.md for details
- `settings/`: Contains settings panels for text, layout, and image properties

### Instructions

- The editor uses a component-based architecture where each component has a specific responsibility
- State is managed through custom hooks (`usePageState`, `useAIOperations`)
- The ZoomableImage component can be used in any context where an image needs zoom and pan capabilities

### Dependencies

- Lucide React for icons
- UI components from shadcn/ui
- React Router for navigation
- Sonner for toast notifications

### Notes

- The editor supports multiple layouts that can be switched at runtime
- AI operations are isolated in their own hook to keep components clean
- Image generation is handled through Supabase Edge Functions
