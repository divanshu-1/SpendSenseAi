'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';
import { Logo } from './logo';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.35 9.94H12V14.4H18.19C17.93 15.77 17.21 16.93 16.14 17.65V20.2H19.95C21.66 18.69 22.56 16.25 22.56 12.25Z" fill="#4285F4"/>
        <path d="M12 23C15.24 23 17.95 21.92 19.95 20.2L16.14 17.65C15.08 18.42 13.67 18.88 12 18.88C9.09 18.88 6.63 17.03 5.72 14.54H1.78V17.22C3.76 21.12 7.59 23 12 23Z" fill="#34A853"/>
        <path d="M5.72 14.54C5.53 13.99 5.42 13.4 5.42 12.77C5.42 12.14 5.53 11.55 5.72 11L1.78 8.32C0.94 10.03 0.44 11.94 0.44 14C0.44 16.06 0.94 17.97 1.78 19.68L5.72 14.54Z" fill="#FBBC05"/>
        <path d="M12 5.12C13.82 5.12 15.34 5.82 16.48 6.88L20.04 3.32C17.95 1.55 15.24 0.5 12 0.5C7.59 0.5 3.76 2.38 1.78 6.28L5.72 9C6.63 6.47 9.09 5.12 12 5.12Z" fill="#EA4335"/>
    </svg>
)

export default function LoginDialog({ isOpen, onClose, onLoginSuccess }: LoginDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!email) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    if (!password && !isSignUp) {
      setError('Please enter your password.');
      setIsLoading(false);
      return;
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (isSignUp) {
        // Mock sign up - accept any email
        toast({
          title: 'Account Created!',
          description: "Welcome to SpendSense AI! Let's analyze your spending.",
        });
        onLoginSuccess();
      } else {
        // Mock login - accept test@example.com or any email with password "password"
        if (email === 'test@example.com' || password === 'password') {
          toast({
            title: 'Login Successful',
            description: "Welcome back! Let's analyze your spending.",
          });
          onLoginSuccess();
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: isSignUp ? 'Sign Up Failed' : 'Login Failed',
        description: 'Invalid credentials. Please try again.',
      });
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    // Simulate Google OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Mock Google sign in - always succeeds
      toast({
        title: 'Google Sign In Successful',
        description: "Welcome to SpendSense AI! Let's analyze your spending.",
      });
      onLoginSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Google Sign In Failed',
        description: 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border p-8 text-card-foreground">
        <DialogHeader className="text-center items-center">
            <Logo className="h-10 w-10 text-primary" />
          <DialogTitle className="text-3xl font-bold font-headline mt-4">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isSignUp ? 'Sign up to start analyzing your spending' : 'Log in to continue to SpendSense AI'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
                <GoogleIcon className="h-5 w-5"/>
                {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            <div className="flex items-center gap-2">
                <div className="h-px w-full bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="h-px w-full bg-border" />
            </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase text-muted-foreground">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-background"
                disabled={isLoading}
              />
            </div>

            {!isSignUp && (
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase text-muted-foreground">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-background"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setPassword('');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>

            {!isSignUp && (
              <p className="text-xs text-muted-foreground">
                Demo: Use <code className="bg-muted px-1 rounded">test@example.com</code> or any email with password <code className="bg-muted px-1 rounded">password</code>
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleLogin}
            className="w-full h-11 bg-primary/90 hover:bg-primary text-primary-foreground font-bold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
