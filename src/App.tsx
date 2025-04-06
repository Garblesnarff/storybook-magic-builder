
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { BookProvider } from "./contexts/BookContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import BooksPage from "./pages/BooksPage";
import EditorPage from "./pages/EditorPage";
import EditorPlaceholderPage from "./pages/EditorPlaceholderPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { initializeStorage } from '@/services/supabase/initStorage';
import { toast } from 'sonner';

function App() {
  useEffect(() => {
    // Create session check function
    const checkAuth = async () => {
      try {
        console.log('App.tsx: Checking auth status...');
        
        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth status:', error);
          toast.error('Authentication error. Some features may not work.');
          return;
        }
        
        if (!data.session) {
          console.log('User is not authenticated. No active session found.');
          toast.info('Some features like saving images require signing in');
        } else {
          console.log('User is authenticated:', data.session.user.id);
          
          // Verify the session is valid and tokens are fresh
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Session refresh failed:', refreshError);
            await supabase.auth.signOut();
            toast.error('Session expired. Please sign in again.');
          } else {
            console.log('Session refreshed successfully in App.tsx');
            console.log('Token will expire at:', 
              new Date(refreshData.session!.expires_at! * 1000).toISOString());
            
            // Check storage access with refreshed session
            await initializeStorage();
          }
        }
      } catch (error) {
        console.error('Unexpected error during auth check:', error);
        toast.error('An error occurred while checking authentication status');
      }
    };
    
    // Run the auth check immediately
    checkAuth();
    
    // Set up auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user.id);
        
        // Check storage access on sign in
        await initializeStorage();
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed in auth listener');
        // Initialize storage after token refresh
        await initializeStorage();
      } else if (event === 'USER_UPDATED') {
        console.log('User updated');
      }
    });
    
    // Add a background interval that refreshes the session periodically
    const tokenRefreshInterval = setInterval(async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        console.log('Background token refresh: Refreshing session...');
        await supabase.auth.refreshSession();
        console.log('Background token refresh completed');
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Clean up on component unmount
    return () => {
      subscription.unsubscribe();
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/books" element={
          <ProtectedRoute>
            <BooksPage />
          </ProtectedRoute>
        } />
        <Route path="/editor/:id" element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        } />
        <Route path="/editor" element={
          <ProtectedRoute>
            <EditorPlaceholderPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
}

export default App;
