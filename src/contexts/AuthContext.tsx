
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Define user type
export interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
}

// Define context type
interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  signInWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

// Custom hook to use Auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // For demo purposes, we'll use local storage to simulate auth
  // In a real app, this would connect to a backend auth service
  useEffect(() => {
    const storedUser = localStorage.getItem('talentEvaluatorUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Save user to local storage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('talentEvaluatorUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Email/password sign in (simulated)
  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This would be a real auth API call in production
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, create a mock user
      const user: User = {
        id: 'user1',
        email,
        name: email.split('@')[0],
      };
      
      setCurrentUser(user);
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign in (simulated)
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, create a mock Google user
      const user: User = {
        id: 'google_user1',
        email: 'user@example.com',
        name: 'Demo User',
        photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
      };
      
      setCurrentUser(user);
      toast.success('Signed in with Google successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email/password (simulated)
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, create a mock user
      const user: User = {
        id: 'new_user1',
        email,
        name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
      };
      
      setCurrentUser(user);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Failed to create account. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    try {
      // Clear user from local storage
      localStorage.removeItem('talentEvaluatorUser');
      setCurrentUser(null);
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset (simulated)
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send password reset email. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    isLoading,
    signInWithEmail,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
