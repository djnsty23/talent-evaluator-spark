
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
      console.log('Google button clicked, initiating sign-in');
      await onClick();
    } catch (error) {
      console.error('Error during Google sign-in button click:', error);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
      disabled={isDisabled}
    >
      <FcGoogle className="mr-2 h-5 w-5" />
      Google
    </Button>
  );
};

export default GoogleButton;
