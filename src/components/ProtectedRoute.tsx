
import { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Effect to redirect if user is not authenticated after loading
  useEffect(() => {
    if (!isLoading && !currentUser) {
      console.log('Not authenticated, redirecting to login');
      // Save the attempted path to redirect back after login
      const returnPath = location.pathname !== '/login' ? location.pathname : '/dashboard';
      navigate('/login', { 
        replace: true,
        state: { returnTo: returnPath }
      });
    }
  }, [currentUser, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-primary/20 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('No current user, redirecting to login');
    return <Navigate to="/login" replace state={{ returnTo: location.pathname }} />;
  }

  console.log('User authenticated, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
