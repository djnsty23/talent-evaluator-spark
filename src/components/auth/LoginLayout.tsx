
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FiArrowLeft } from 'react-icons/fi';

interface LoginLayoutProps {
  children: React.ReactNode;
}

const LoginLayout = ({ children }: LoginLayoutProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')} 
        className="absolute top-4 left-4 flex items-center gap-2"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
      
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
};

export default LoginLayout;
