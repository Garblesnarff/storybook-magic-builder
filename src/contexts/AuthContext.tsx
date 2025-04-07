
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Set up auth state management
  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    setLoading(true); // Ensure loading is true during setup
    
    // Create session fetching function separate from the listener
    const fetchInitialSession = async () => {
      try {
        console.log('AuthContext: Fetching initial session');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          return;
        }
        
        if (data?.session) {
          console.log('Initial session found for user:', data.session.user.id);
          setSession(data.session);
          setUser(data.session.user);
          
          // Auto-refresh the session
          try {
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.warn('Failed to refresh session on init:', refreshError);
            } else {
              console.log('Session refreshed on init');
            }
          } catch (refreshError) {
            console.error('Exception during refresh on init:', refreshError);
          }
        } else {
          console.log('No initial session found');
        }
      } catch (err) {
        console.error('Unexpected error during getInitialSession:', err);
      } finally {
        setLoading(false);
        console.log('AuthContext: Initial session fetch completed');
      }
    };
    
    // Start the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('AuthContext: Auth state change event:', event);
        
        if (event === 'SIGNED_IN') {
          console.log('AuthContext: User signed in:', currentSession?.user.id);
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
          
          // Prevent navigation loop by checking if already on /books
          if (window.location.pathname !== '/books') {
            navigate('/books');
          }
          toast.success('Successfully signed in');
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthContext: User signed out');
          setSession(null);
          setUser(null);
          setLoading(false);
          
          // Prevent navigation loop
          if (window.location.pathname !== '/' && 
              window.location.pathname !== '/auth') {
            navigate('/');
          }
          toast.info('Signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('AuthContext: Token refreshed');
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        } else if (event === 'USER_UPDATED') {
          console.log('AuthContext: User updated');
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        }
      }
    );

    // Fetch the initial session after the listener is set up
    fetchInitialSession();

    // Cleanup subscription
    return () => {
      console.log('AuthContext: Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Manual session check (runs every 5 minutes as backup)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!loading) { // Only run if initial loading is complete
        try {
          console.log('AuthContext: Performing scheduled session check...');
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error checking session:', error);
            return;
          }
          
          if (!data.session && user) {
            // We think we're logged in but session is gone
            console.warn('Session lost, updating state');
            setSession(null);
            setUser(null);
            toast.error('Your session has expired. Please sign in again.');
            navigate('/auth');
          } else if (data.session) {
            // We have a session, refresh it
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('Failed to refresh token during interval check:', refreshError);
            } else {
              console.log('Session refreshed during interval check');
            }
          }
        } catch (error) {
          console.error('Error during scheduled session check:', error);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, [user, navigate, loading]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('AuthContext: Attempting sign in for:', email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error('AuthContext: Sign in error:', error.message);
      toast.error(error.message || 'Error signing in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('AuthContext: Attempting sign up for:', email);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success('Registration successful! Please check your email to confirm your account.');
    } catch (error: any) {
      console.error('AuthContext: Sign up error:', error.message);
      toast.error(error.message || 'Error signing up');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('AuthContext: Signing out');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('AuthContext: Sign out error:', error.message);
      toast.error(error.message || 'Error signing out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
