
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatUser } from '@/utils/authUtils';
import { AuthUser } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Hook to manage authentication state (current user and loading state)
 */
export const useAuthState = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle URL hash fragments for OAuth redirects
  useEffect(() => {
    const handleHashFragment = async () => {
      // Check if we have an access_token in the URL hash (OAuth redirect)
      if (location.hash && location.hash.includes('access_token=')) {
        console.log('Detected access_token in URL hash, processing OAuth response');
        
        try {
          // Let Supabase handle the OAuth response
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error processing OAuth response:', error);
            toast.error('Failed to complete sign in. Please try again.');
          } else {
            console.log('Successfully processed OAuth response');
            // Clear the hash fragment from the URL
            window.history.replaceState(null, document.title, window.location.pathname);
            
            if (data.session) {
              // We'll let the auth state change event handle the redirection
              toast.success('Successfully signed in!');
            }
          }
        } catch (error) {
          console.error('OAuth callback processing error:', error);
        }
      }
    };
    
    handleHashFragment();
  }, [location.hash]);

  // Setup Supabase auth listener
  useEffect(() => {
    setIsLoading(true);
    
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const formattedUser = formatUser(session);
      console.log('Initial session check:', formattedUser ? 'User found' : 'No user');
      setCurrentUser(formattedUser);
      setIsLoading(false);
      
      // If user is already logged in and on login page, redirect to dashboard
      if (formattedUser && location.pathname === '/login') {
        navigate('/dashboard');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event);
      const formattedUser = formatUser(session);
      setCurrentUser(formattedUser);
      setIsLoading(false);
      
      // Handle various auth events
      if (_event === 'SIGNED_IN' && formattedUser) {
        console.log('User signed in, redirecting to dashboard');
        navigate('/dashboard');
      } else if (_event === 'SIGNED_OUT') {
        console.log('User signed out');
        // Only redirect to login if not already there
        if (location.pathname !== '/login' && location.pathname !== '/') {
          navigate('/login');
        }
      } else if (_event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      } else if (_event === 'USER_UPDATED') {
        console.log('User updated');
        toast.success('Account information updated');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return {
    currentUser,
    isLoading,
    setIsLoading
  };
};
