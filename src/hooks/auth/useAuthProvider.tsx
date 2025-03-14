
import { useAuthState } from './useAuthState';
import { useEmailAuth } from './useEmailAuth';
import { useOAuthAuth } from './useOAuthAuth';
import { useSignOut } from './useSignOut';

/**
 * Main auth provider hook that combines all auth functionality
 */
export const useAuthProvider = () => {
  const { currentUser, isLoading: isStateLoading } = useAuthState();
  const { signInWithEmail, signUp, resetPassword, isAuthLoading } = useEmailAuth();
  const { signInWithGoogle } = useOAuthAuth();
  const { signOut, isSignOutLoading } = useSignOut();
  
  // Combine loading states
  const isLoading = isStateLoading || isAuthLoading || isSignOutLoading;

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
