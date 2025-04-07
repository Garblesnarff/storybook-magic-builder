
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Helper function to check authentication with retry mechanism
 * Used by storage services to ensure valid authentication before operations
 */
export const checkAndRefreshAuthentication = async (): Promise<boolean> => {
  // First check for current session
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error checking session:', error);
    return false;
  }
  
  if (!data.session) {
    console.log('No session found. Attempting to refresh...');
    
    // Try to refresh the session
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !refreshData.session) {
      console.error('Failed to refresh session:', refreshError);
      toast.error('Authentication expired. Please sign in again.');
      return false;
    }
    
    console.log('Session refreshed successfully');
    return true;
  }
  
  // Session exists but let's make sure token is fresh
  const { error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError) {
    console.error('Failed to refresh existing session:', refreshError);
    return false;
  }
  
  return true;
};

/**
 * Function to get current auth status (for debugging)
 */
export const logAuthStatus = async () => {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    console.log('Current auth status: Authenticated as', data.session.user.id);
    console.log('Token expires at:', new Date(data.session.expires_at! * 1000).toISOString());
  } else {
    console.log('Current auth status: Not authenticated');
  }
};
