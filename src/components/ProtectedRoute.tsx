
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading, session } = useAuth();
  const navigate = useNavigate();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  
  // Log the current auth state for debugging
  useEffect(() => {
    console.log('ProtectedRoute: Auth state -', {
      authLoading,
      authCheckComplete,
      hasUser: !!user,
      hasSession: !!session
    });
  }, [authLoading, authCheckComplete, user, session]);
  
  // Set a timeout to ensure we don't get stuck in the loading state
  useEffect(() => {
    // If auth is still loading after 3 seconds, show retry option
    const timer = setTimeout(() => {
      if (authLoading) {
        console.log('ProtectedRoute: Auth check taking too long, showing retry option');
        setShowRetry(true);
      }
    }, 3000); // 3 second timeout
    
    // If auth is still loading after 10 seconds, force completion
    const forceTimer = setTimeout(() => {
      if (authLoading) {
        console.log('ProtectedRoute: Auth check taking too long, forcing completion');
        setAuthCheckComplete(true);
      }
    }, 10000); // 10 second timeout
    
    return () => {
      clearTimeout(timer);
      clearTimeout(forceTimer);
    };
  }, [authLoading]);
  
  // Mark auth check as complete when loading ends
  useEffect(() => {
    if (!authLoading) {
      setAuthCheckComplete(true);
    }
  }, [authLoading]);
  
  // Monitor session validity and redirect if not authenticated
  useEffect(() => {
    if (!authLoading && authCheckComplete && !user && !session) {
      console.log('ProtectedRoute: No user/session found after auth check completed');
      // Only show the toast if we weren't already on the auth page
      if (window.location.pathname !== '/auth') {
        toast.info('Please sign in to access this page');
        navigate('/auth');
      }
    }
  }, [user, authLoading, session, navigate, authCheckComplete]);

  const handleRetry = () => {
    // Reset states
    setShowRetry(false);
    setAuthCheckComplete(false);
    // Force a hard reload to refresh everything
    window.location.reload();
  };

  // Show a more informative loading state
  if (authLoading && !authCheckComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600 mb-4">Verifying your account...</p>
        {showRetry && (
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="mt-4"
            >
              Taking too long? Click to retry
            </Button>
            
            <Button 
              onClick={() => navigate('/auth')}
              variant="secondary"
              className="mt-2"
            >
              Return to login
            </Button>
          </div>
        )}
      </div>
    );
  }

  // If auth check is complete but no user, redirect to auth page
  if (authCheckComplete && !user) {
    console.log('ProtectedRoute: No user found, redirecting to auth page');
    return <Navigate to="/auth" />;
  }

  // Render children if authenticated
  console.log('ProtectedRoute: User is authenticated, rendering protected content');
  return <>{children}</>;
};
