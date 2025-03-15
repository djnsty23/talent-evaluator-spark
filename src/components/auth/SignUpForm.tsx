
import React from 'react';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import InputField from './InputField';
import GoogleButton from './GoogleButton';
import AuthDivider from './AuthDivider';

interface SignUpFormProps {
  onSignUp: (e: React.FormEvent) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  isSubmitting: boolean;
  error: string;
}

const SignUpForm = ({
  onSignUp,
  onGoogleSignIn,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  isSubmitting,
  error
}: SignUpFormProps) => {
  return (
    <form onSubmit={onSignUp}>
      <CardContent className="space-y-4">
        <InputField
          icon={<FiUser />}
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
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
          minLength={6}
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
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
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

export default SignUpForm;
