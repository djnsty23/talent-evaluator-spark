
import React from 'react';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';

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
        <div className="space-y-2">
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
              minLength={6}
            />
          </div>
        </div>
        
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
        
        <div className="relative w-full flex items-center justify-center">
          <span className="bg-card px-2 text-xs text-muted-foreground z-10">or continue with</span>
          <div className="absolute w-full h-px bg-border/70 top-1/2 -translate-y-1/2"></div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onGoogleSignIn}
          disabled={isSubmitting}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Google
        </Button>
      </CardFooter>
    </form>
  );
};

export default SignUpForm;
