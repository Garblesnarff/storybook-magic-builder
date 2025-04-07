
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  
  // Monitor session validity
  useEffect(() => {
    if (!loading && !user && !session) {
      // Only show the toast if we weren't already on the auth page
      if (window.location.pathname !== '/auth') {
        toast.info('Please sign in to access this page');
      }
    }
  }, [user, loading, session, navigate]);

  // Show a more informative loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Verifying your account...</p>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Render children if authenticated
  return <>{children}</>;
};
