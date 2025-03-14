
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/button';

interface GoogleButtonProps {
  onClick: () => Promise<void>;
  isDisabled: boolean;
}

const GoogleButton = ({ onClick, isDisabled }: GoogleButtonProps) => {
  const handleClick = async () => {
    try {
      console.log('Google button clicked, initiating OAuth flow');
      await onClick();
    } catch (error) {
      console.error('Error during Google sign-in button click:', error);
      // Error is already handled in the hook with toast messages
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-2 relative"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label="Sign in with Google"
    >
      <FcGoogle className="h-5 w-5" />
      <span>Continue with Google</span>
      
      {/* Tooltip/hint for users */}
      <div className="hidden group-hover:block absolute -top-14 left-0 right-0 mx-auto w-64 text-xs bg-background border border-border rounded p-2 shadow-md">
        If you encounter issues, ensure third-party cookies are enabled in your browser.
      </div>
    </Button>
  );
};

export default GoogleButton;
