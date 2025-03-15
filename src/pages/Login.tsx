
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import LoginLayout from '@/components/auth/LoginLayout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const { currentUser, signInWithEmail, signInWithGoogle, signUp, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  
  // Check query params for active tab or location state
  useEffect(() => {
    // Get destination from location state
    const returnTo = location.state?.returnTo || '/dashboard';
    
    // If user is already logged in, redirect to destination
    if (currentUser && !isLoading) {
      console.log('User already logged in, redirecting to:', returnTo);
      navigate(returnTo, { replace: true });
      return;
    }
    
    // Check URL for signup param
    const params = new URLSearchParams(location.search);
    if (params.get('signup') === 'true') {
      setActiveTab('signup');
    }
  }, [currentUser, isLoading, location, navigate]);

  // Handle email sign in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signInWithEmail(email, password);
      // No need to redirect here, useAuth handles it
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setError('');
    
    try {
      await signInWithGoogle();
      // Auth state change will handle redirect
    } catch (error: any) {
      // Error is handled in the hook
      console.error('Google sign in error:', error);
    }
  };
  
  // Handle sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signUp(email, password, name);
      toast.success('Account created successfully! You can now sign in.');
      setActiveTab('signin');
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginLayout>
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'signin' 
              ? 'Enter your credentials to access your account' 
              : 'Fill in your details to create a new account'}
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
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
