
// Re-export all storage functionality from this central file

// Authentication helpers
export { checkAndRefreshAuthentication, logAuthStatus } from './auth';

// Image services
export { 
  uploadImage,
  deleteBookImages,
  deletePageImages
} from './imageService';

// Narration services
export {
  uploadAudio,
  deletePageNarration
} from './narrationService';

// Utilities
export { ensureStorageBuckets } from './utils';
