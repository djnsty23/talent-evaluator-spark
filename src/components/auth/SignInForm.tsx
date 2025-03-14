
import React from 'react';
import { FiMail, FiLock } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import InputField from './InputField';
import GoogleButton from './GoogleButton';
import AuthDivider from './AuthDivider';

interface SignInFormProps {
  onEmailSignIn: (e: React.FormEvent) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isSubmitting: boolean;
  error: string;
}

const SignInForm = ({
  onEmailSignIn,
  onGoogleSignIn,
  email,
  setEmail,
  password,
  setPassword,
  isSubmitting,
  error
}: SignInFormProps) => {
  return (
    <form onSubmit={onEmailSignIn}>
      <CardContent className="space-y-4">
        <InputField
          icon={<FiMail />}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <InputField
          icon={<FiLock />}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
        
        <AuthDivider />
        
        <GoogleButton 
          onClick={onGoogleSignIn}
          isDisabled={isSubmitting}
        />
      </CardFooter>
    </form>
  );
};

export default SignInForm;
