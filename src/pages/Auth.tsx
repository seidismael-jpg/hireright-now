import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { AppRole } from '@/types/database';
import { cn } from '@/lib/utils';

type AuthMode = 'signin' | 'signup';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Sign in failed',
            description: error.message === 'Invalid login credentials' 
              ? 'Invalid email or password. Please try again.'
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully signed in.',
          });
          navigate('/');
        }
      } else {
        if (!fullName.trim()) {
          toast({
            title: 'Name required',
            description: 'Please enter your full name.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) {
          if (error.message?.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Please sign in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Welcome to ServiceHub!',
            description: selectedRole === 'provider' 
              ? 'Your provider account is pending approval.'
              : 'Your account has been created.',
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileLayout className="flex flex-col justify-center">
      <div className="flex-1 flex flex-col justify-center px-2">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">ServiceHub</h1>
          <p className="text-muted-foreground">
            {mode === 'signin' 
              ? 'Sign in to continue' 
              : 'Create your account'}
          </p>
        </div>

        {/* Role Selection for Signup */}
        {mode === 'signup' && (
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">I want to</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={cn(
                  "flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200",
                  selectedRole === 'customer'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <User className={cn(
                  "w-8 h-8 mb-2",
                  selectedRole === 'customer' ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="font-medium">Find Services</span>
                <span className="text-xs text-muted-foreground">I need help</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedRole('provider')}
                className={cn(
                  "flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200",
                  selectedRole === 'provider'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Briefcase className={cn(
                  "w-8 h-8 mb-2",
                  selectedRole === 'provider' ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="font-medium">Offer Services</span>
                <span className="text-xs text-muted-foreground">I'm a pro</span>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="mt-1 h-12 rounded-xl"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 h-12 rounded-xl"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 rounded-xl pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-primary font-semibold mt-1"
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
