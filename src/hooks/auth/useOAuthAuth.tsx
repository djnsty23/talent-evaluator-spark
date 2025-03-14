
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
      const redirectTo = window.location.origin;
      console.log('Setting redirect URL to:', redirectTo);
      
      // Use the redirectTo parameter to ensure proper return to application
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo, // Set explicit redirect back to our app
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
      
      // Provide more specific error messages
      if (error.message?.includes('refused to connect')) {
        toast.error('Connection to Google authentication failed. Please check your Supabase project configuration for correct Site URL and Redirect URL.');
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
