
// This file now acts as a facade to maintain backward compatibility
// It re-exports all functionality from the new modular storage services

export {
  checkAndRefreshAuthentication,
  logAuthStatus,
  uploadImage, 
  deleteBookImages,
  deletePageImages,
  uploadAudio,
  deletePageNarration,
  ensureStorageBuckets
} from './storage';
