
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to handle OAuth-based authentication (Google, etc.)
 */
export const useOAuthAuth = () => {
  // Google sign in with proper redirection handling
  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in process');
      
      // Show a user-friendly message
      toast.info('Redirecting to Google for authentication...');
      
      // Get the current URL's origin to use as base for redirection
      const origin = window.location.origin;
      console.log('Current origin:', origin);
      
      // Use the redirectTo parameter to ensure proper return to application
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/login`, // Explicitly redirect back to login page
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Google sign-in initiated successfully');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      // Provide specific error messages for common issues
      if (error.message?.includes('refused to connect')) {
        toast.error('Connection to Google authentication failed. Please check that your Supabase project has the correct Site URL and Redirect URL configured.');
      } else if (error.message?.includes('popup')) {
        toast.error('Google popup was blocked. Please allow popups for this site and try again.');
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
