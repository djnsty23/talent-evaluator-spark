
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to handle OAuth-based authentication (Google, etc.)
 */
export const useOAuthAuth = () => {
  // Google sign in - simplified approach
  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in with simplified approach');
      
      // Show a user-friendly message
      toast.info('Redirecting to Google for authentication...');
      
      // Use the simple approach without custom redirect
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Navigation is handled automatically by Supabase
      console.log('Google sign-in initiated successfully');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      // Clear error messages
      if (error.message?.includes('refused to connect')) {
        toast.error('Connection to Google authentication failed. Please try again or check your browser cookies and extensions.');
      } else {
        toast.error(error.message || 'Failed to sign in with Google.');
      }
      
      throw error;
    }
  };

  return {
    signInWithGoogle
  };
};
