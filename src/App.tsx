
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
    const checkAuth = async () => {
      try {
        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth status:', error);
          toast.error('Authentication error. Some features may not work.');
          return;
        }
        
        if (!data.session) {
          console.log('User is not authenticated. Attempting sign in with last session...');
          
          // Try to restore the session
          const { data: signInData, error: signInError } = await supabase.auth.signInWithLastSession();
          
          if (signInError) {
            console.error('Error signing in with last session:', signInError);
            toast.info('Some features like saving images require signing in');
          } else if (signInData.session) {
            console.log('Successfully signed in with last session:', signInData.session.user.id);
            
            // Check storage access now that we're authenticated
            await initializeStorage();
          } else {
            console.log('No previous session found');
            toast.info('Sign in to enable saving images and books');
          }
        } else {
          console.log('User is authenticated:', data.session.user.id);
          
          // Verify the session is valid
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error('Session refresh failed, attempting to sign in again:', refreshError);
            await supabase.auth.signOut();
            toast.error('Session expired. Please sign in again.');
          } else {
            console.log('Session refreshed successfully');
            
            // Check storage access on sign in
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
        toast.success('Successfully signed in');
        
        // Check storage access on sign in
        await initializeStorage();
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        toast.info('You have been signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      } else if (event === 'USER_UPDATED') {
        console.log('User updated');
      }
    });
    
    return () => {
      subscription.unsubscribe();
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
