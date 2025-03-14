
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import LoginLayout from '@/components/auth/LoginLayout';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { signInWithEmail, signInWithGoogle, signUp, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract tab parameter from URL
  const searchParams = new URLSearchParams(location.search);
  const signupParam = searchParams.get('signup');
  const defaultTab = signupParam === 'true' ? 'signup' : 'signin';

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await signInWithEmail(email, password);
      // Navigation is handled in the auth context
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await signUp(email, password, name);
      // Navigation is handled in the auth context
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    
    try {
      console.log('Initiating Google sign-in from Login page');
      await signInWithGoogle();
      // Navigation is handled automatically via redirectTo option
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <LoginLayout>
      <Card className="border-border/40 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <SignInForm
              onEmailSignIn={handleEmailSignIn}
              onGoogleSignIn={handleGoogleSignIn}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isSubmitting={isSubmitting}
              error={error}
            />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignUpForm
              onSignUp={handleSignUp}
              onGoogleSignIn={handleGoogleSignIn}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              name={name}
              setName={setName}
              isSubmitting={isSubmitting}
              error={error}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </LoginLayout>
  );
};

export default Login;
