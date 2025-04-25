
// Re-export image storage functions
export { 
  uploadImage, 
  deleteBookImages, 
  deletePageImages, 
  cleanupOrphanedImages 
} from './imageStorage';

// Audio storage functions
export { 
  uploadAudio, 
  deletePageNarration 
} from './audioStorage';
