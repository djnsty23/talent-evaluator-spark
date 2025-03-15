
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showRefreshButton?: boolean;
}

const ErrorPage = ({
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again later.",
  showHomeButton = true,
  showRefreshButton = true
}: ErrorPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <AlertTriangle className="h-16 w-16 text-amber-500 mb-6" />
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-8 max-w-md">{message}</p>
      
      <div className="flex flex-wrap gap-4 justify-center">
        {showHomeButton && (
          <Button onClick={() => navigate('/')} variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        )}
        
        {showRefreshButton && (
          <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
