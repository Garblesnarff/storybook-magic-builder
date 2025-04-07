
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  
  // Set a timeout to ensure we don't get stuck in the loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Auth check taking too long, forcing completion');
        setAuthCheckComplete(true);
        setShowRetry(true);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timer);
  }, [loading]);
  
  // Mark auth check as complete when loading ends
  useEffect(() => {
    if (!loading) {
      setAuthCheckComplete(true);
    }
  }, [loading]);
  
  // Monitor session validity
  useEffect(() => {
    if (!loading && !user && !session) {
      // Only show the toast if we weren't already on the auth page
      if (window.location.pathname !== '/auth') {
        toast.info('Please sign in to access this page');
      }
    }
  }, [user, loading, session, navigate]);

  const handleRetry = () => {
    // Force a hard reload to refresh everything
    window.location.reload();
  };

  // Show a more informative loading state
  if (loading && !authCheckComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600 mb-4">Verifying your account...</p>
        {showRetry && (
          <Button 
            onClick={handleRetry}
            variant="outline"
            className="mt-4"
          >
            Taking too long? Click to retry
          </Button>
        )}
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    console.log('No user found, redirecting to auth page');
    return <Navigate to="/auth" />;
  }

  // Render children if authenticated
  console.log('User is authenticated, rendering protected content');
  return <>{children}</>;
};
