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
      <div className="flex-1 flex flex-col justify-center px-6 animate-fade-in">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">ServiceHub</h1>
          <p className="text-muted-foreground font-medium">
            {mode === 'signin' 
              ? 'Sign in to continue' 
              : 'Create your account'}
          </p>
        </div>

        {/* Role Selection for Signup */}
        {mode === 'signup' && (
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Label className="text-sm font-semibold mb-4 block text-foreground">I want to</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={cn(
                  "flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-300",
                  selectedRole === 'customer'
                    ? "border-foreground bg-foreground/5"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors",
                  selectedRole === 'customer' ? "bg-foreground text-background" : "bg-secondary"
                )}>
                  <User className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <span className="font-semibold">Find Services</span>
                <span className="text-xs text-muted-foreground mt-1">I need help</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedRole('provider')}
                className={cn(
                  "flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-300",
                  selectedRole === 'provider'
                    ? "border-foreground bg-foreground/5"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors",
                  selectedRole === 'provider' ? "bg-foreground text-background" : "bg-secondary"
                )}>
                  <Briefcase className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <span className="font-semibold">Offer Services</span>
                <span className="text-xs text-muted-foreground mt-1">I'm a pro</span>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
              <Label htmlFor="fullName" className="text-sm font-semibold">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="mt-2 h-14 rounded-2xl px-5 text-base border-border bg-secondary/50 focus:bg-background transition-colors"
                required
              />
            </div>
          )}

          <div className="animate-slide-up" style={{ animationDelay: mode === 'signup' ? '200ms' : '100ms' }}>
            <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 h-14 rounded-2xl px-5 text-base border-border bg-secondary/50 focus:bg-background transition-colors"
              required
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: mode === 'signup' ? '250ms' : '150ms' }}>
            <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-14 rounded-2xl px-5 pr-14 text-base border-border bg-secondary/50 focus:bg-background transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2 animate-slide-up" style={{ animationDelay: mode === 'signup' ? '300ms' : '200ms' }}>
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </div>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p className="text-muted-foreground">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-foreground font-semibold mt-2 hover:underline"
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}