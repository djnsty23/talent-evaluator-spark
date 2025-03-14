
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatUser } from '@/utils/authUtils';
import { AuthUser } from '@/contexts/AuthContext';

export const useAuthProvider = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Setup Supabase auth listener
  useEffect(() => {
    setIsLoading(true);
    
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const formattedUser = formatUser(session);
      console.log('Initial session check:', formattedUser);
      setCurrentUser(formattedUser);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event);
      const formattedUser = formatUser(session);
      setCurrentUser(formattedUser);
      setIsLoading(false);
      
      // If user signs in, redirect to dashboard
      if (_event === 'SIGNED_IN' && formattedUser) {
        console.log('User signed in, redirecting to dashboard');
        navigate('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Email/password sign in
  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Signed in with email:', data);
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign in
  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in');
      
      // Show a user-friendly message about potential issues
      toast.info('Redirecting to Google for authentication. If you see errors, check browser settings for third-party cookies.');
      
      // Get base URL and print it for debugging
      const origin = window.location.origin;
      console.log('Current origin:', origin);
      
      // Setup redirect URL - must match what's configured in Google Console
      const redirectUrl = `${origin}/dashboard`;
      console.log('Using redirect URL:', redirectUrl);
      
      // Log the complete auth configuration attempt for debugging
      console.log('Auth configuration:', {
        provider: 'google',
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      });
      
      // Handle potential browser issues
      if (navigator.cookieEnabled === false) {
        console.error('Cookies are disabled in this browser');
        toast.error('Cookies must be enabled for Google Sign-In to work');
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      if (error) {
        console.error('Google sign in error from Supabase:', error);
        toast.error(error.message || 'Failed to sign in with Google.');
        throw error;
      }
      
      console.log('Google sign-in response:', data);
      // The navigation happens automatically via redirectTo
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      // Provide more specific error messages based on common issues
      if (error.message?.includes('refused to connect')) {
        toast.error('Connection to Google authentication servers failed. Please check your browser settings and ensure third-party cookies are enabled.');
      } else if (error.message?.includes('redirect_uri_mismatch')) {
        toast.error('OAuth configuration error: Redirect URI mismatch. Check your Google Cloud Console settings.');
      } else {
        toast.error(error.message || 'Failed to sign in with Google.');
      }
      
      throw error;
    }
  };

  // Sign up with email/password
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
      
      console.log('Signed up:', data);
      toast.success('Account created successfully! You can now sign in.');
      navigate('/login');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setCurrentUser(null);
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send password reset email. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentUser,
    isLoading,
    signInWithEmail,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
  };
};
