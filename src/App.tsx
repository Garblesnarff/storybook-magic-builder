
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
    // Check if storage is accessible by just listing buckets
    initializeStorage().catch(err => {
      console.error('Failed to check storage:', err);
    });
    
    // Check authentication status
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking auth status:', error);
        toast.error('Authentication error. Some features may not work.');
      } else if (!data.session) {
        console.log('User is not authenticated');
        toast.info('Some features like saving images require signing in');
      } else {
        console.log('User is authenticated:', data.session.user.id);
      }
    };
    
    checkAuth();
    
    // Set up auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('User signed in');
        toast.success('Successfully signed in');
        
        // Check storage access on sign in
        initializeStorage().catch(console.error);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        toast.info('You have been signed out');
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
