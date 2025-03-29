
# Image Zoom Hooks

This directory contains smaller, focused hooks that are composed together in the main `useZoomableImage` hook. Breaking down the functionality into smaller hooks improves maintainability, readability, and testability.

## Files

- `useImageDimensions.ts`: Manages image and container dimensions, loading state.
- `useImageFit.ts`: Handles image fit methods (contain/cover) and auto-fitting logic.
- `useImageZoom.ts`: Manages zoom level state and zoom in/out operations.
- `useImagePan.ts`: Handles image panning operations and state.
- `useSettingsSync.ts`: Synchronizes image settings with external state and saves settings.
- `index.ts`: Barrel file that exports all hooks for easier importing.

## Usage

These hooks are meant to be used internally by the `useZoomableImage` hook and should not be used directly by components unless there's a specific need for isolated functionality.
