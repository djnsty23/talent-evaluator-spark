
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/button';

interface GoogleButtonProps {
  onClick: () => Promise<void>;
  isDisabled: boolean;
}

const GoogleButton = ({ onClick, isDisabled }: GoogleButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={onClick}
      disabled={isDisabled}
    >
      <FcGoogle className="mr-2 h-5 w-5" />
      Google
    </Button>
  );
};

export default GoogleButton;
