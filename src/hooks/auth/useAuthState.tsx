
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return {
    currentUser,
    isLoading,
    setIsLoading
  };
};
