
export const verifyImageUrl = async (url: string): Promise<boolean> => {
  // Skip verification for base64 images as they're always valid in memory
  if (url.startsWith('data:image')) {
    return true;
  }
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      cache: 'no-store', // Prevent caching completely
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.error(`Image verification failed with status: ${response.status} for URL: ${url}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Image verification failed:', error);
    return false;
  }
};

export const preloadImage = (url: string): Promise<void> => {
  // Skip preloading for base64 images as they're already in memory
  if (url.startsWith('data:image')) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Add timestamp to URL to prevent browser caching
    const cacheBustedUrl = url.includes('?') 
      ? `${url}&_t=${Date.now()}` 
      : `${url}?_t=${Date.now()}`;
    
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = cacheBustedUrl;
  });
};
