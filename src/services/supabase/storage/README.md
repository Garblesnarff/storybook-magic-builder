
# Storage Services

This directory contains modular services for interacting with Supabase Storage.

## Files

- `imageStorage.ts`: Handles image upload, deletion, and cleanup operations
- `audioStorage.ts`: Handles audio upload and deletion operations
- `index.ts`: Re-exports all storage functions to maintain the same API

## Usage

```typescript
// Import specific functions directly
import { uploadImage, deleteBookImages } from '@/services/supabase/storage/imageStorage';
import { uploadAudio, deletePageNarration } from '@/services/supabase/storage/audioStorage';

// Or import everything from the index
import { uploadImage, uploadAudio, deleteBookImages } from '@/services/supabase/storage';
```

## Dependencies

- Supabase storage client
- Toast notifications via sonner
```
