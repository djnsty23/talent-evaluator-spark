
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-md mx-auto px-4 py-16 flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Search className="h-12 w-12 text-primary" />
      </div>
      
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      
      <p className="text-muted-foreground mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Button 
          onClick={() => navigate(-1)} 
          variant="outline"
          className="flex items-center gap-2 flex-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        
        <Button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 flex-1"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
