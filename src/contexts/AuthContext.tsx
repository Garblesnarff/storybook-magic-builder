
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
    console.log('Setting up auth state listener');
    
    // Get initial session first
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          return;
        }
        
        if (data?.session) {
          console.log('Initial session found', data.session.user.id);
          setSession(data.session);
          setUser(data.session.user);
          
          // Auto-refresh the session
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.warn('Failed to refresh session on init:', refreshError);
          } else {
            console.log('Session refreshed on init');
          }
        } else {
          console.log('No initial session found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error during getInitialSession:', err);
        setLoading(false);
      }
    };
    
    // Call immediately
    getInitialSession();
    
    // Set up the subscription for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (event === 'SIGNED_IN') {
          console.log('User signed in:', currentSession?.user.id);
          toast.success('Successfully signed in');
          navigate('/books');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          toast.info('Signed out');
          navigate('/');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        } else if (event === 'USER_UPDATED') {
          console.log('User updated');
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Manual session check (runs every 10 minutes as backup)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          console.warn('Session lost during interval check, attempting refresh');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshData.session) {
            console.error('Failed to refresh session during interval check:', refreshError);
            setSession(null);
            setUser(null);
            toast.error('Your session has expired. Please sign in again.');
            navigate('/auth');
          } else {
            console.log('Session refreshed during interval check');
            setSession(refreshData.session);
            setUser(refreshData.session?.user ?? null);
          }
        }
      }
    }, 10 * 60 * 1000); // Check every 10 minutes
    
    return () => clearInterval(interval);
  }, [user, navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success('Registration successful! Please check your email to confirm your account.');
    } catch (error: any) {
      toast.error(error.message || 'Error signing up');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
      throw error;
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
