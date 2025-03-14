
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatUser } from '@/utils/authUtils';
import { AuthUser } from '@/contexts/AuthContext';

/**
 * Hook to manage authentication state (current user and loading state)
 */
export const useAuthState = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Setup Supabase auth listener
  useEffect(() => {
    setIsLoading(true);
    
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const formattedUser = formatUser(session);
      console.log('Initial session check:', formattedUser);
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
        console.log('User signed out, redirecting to login');
        navigate('/login');
      } else if (_event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      } else if (_event === 'USER_UPDATED') {
        console.log('User updated');
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
