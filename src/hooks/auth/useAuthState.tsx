
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatUser } from '@/utils/authUtils';
import { AuthUser } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Hook to manage authentication state (current user and loading state)
 * with optimized rendering to prevent unnecessary refreshes
 */
export const useAuthState = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Memoized handler for OAuth redirects
  const handleHashFragment = useCallback(async () => {
    // Only process if we have an access_token in the URL hash (OAuth redirect)
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
          // Clear the hash fragment from the URL without causing a refresh
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (data.session) {
            // We'll let the auth state change event handle the redirection
            toast.success('Successfully signed in!');
          }
        }
      } catch (error) {
        console.error('OAuth callback processing error:', error);
      }
    }
  }, [location.hash]);
  
  // Handle URL hash fragments for OAuth redirects
  useEffect(() => {
    handleHashFragment();
  }, [handleHashFragment]);

  // Setup Supabase auth listener with proper cleanup
  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;
    
    // Initial session check function
    const checkInitialSession = async () => {
      if (!mounted) return;
      
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const formattedUser = formatUser(session);
        console.log('Initial session check:', formattedUser ? 'User found' : 'No user');
        
        if (mounted) {
          setCurrentUser(formattedUser);
          
          // If user is already logged in and on login page, redirect to dashboard
          if (formattedUser && location.pathname === '/login') {
            navigate('/dashboard', { replace: true });
          }
        }
      } catch (error) {
        console.error('Initial session check error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Run initial session check
    checkInitialSession();

    // Setup auth state change listener
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', _event);
        const formattedUser = formatUser(session);
        
        // Only update state if there's an actual change to prevent re-renders
        setCurrentUser(prev => {
          if (
            (prev === null && formattedUser === null) || 
            (prev?.id === formattedUser?.id)
          ) {
            return prev; // No change, prevent re-render
          }
          return formattedUser;
        });
        
        setIsLoading(false);
        
        // Handle various auth events
        switch (_event) {
          case 'SIGNED_IN':
            if (formattedUser) {
              console.log('User signed in, redirecting to dashboard');
              navigate('/dashboard', { replace: true });
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('User signed out');
            // Only redirect to login if not already there
            if (location.pathname !== '/login' && location.pathname !== '/') {
              navigate('/login', { replace: true });
            }
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            break;
            
          case 'USER_UPDATED':
            console.log('User updated');
            toast.success('Account information updated');
            break;
            
          default:
            break;
        }
      });
      
      authSubscription = data.subscription;
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      if (mounted) {
        setIsLoading(false);
      }
    }

    // Cleanup function to prevent memory leaks and stale auth states
    return () => {
      mounted = false;
      if (authSubscription) {
        console.log('Unsubscribing from auth state changes');
        authSubscription.unsubscribe();
      }
    };
  }, [navigate, location.pathname]);

  return {
    currentUser,
    isLoading,
    setIsLoading
  };
};
