
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to handle email-based authentication (signin, signup, password reset)
 */
export const useEmailAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Email/password sign in
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Signed in with email:', data);
      toast.success('Signed in successfully');
      
      // Navigation is handled by auth state change listener
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      
      if (error) throw error;
      
      console.log('Signed up:', data);
      toast.success('Account created successfully! You can now sign in.');
      // Don't navigate - let the user sign in manually as the confirmation email might be needed
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Password reset
  const resetPassword = useCallback(async (email: string) => {
    if (isLoading) return;
    
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
  }, [isLoading]);

  return {
    signInWithEmail,
    signUp,
    resetPassword,
    isAuthLoading: isLoading
  };
};
