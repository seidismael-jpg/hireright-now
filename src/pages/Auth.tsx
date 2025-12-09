import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Briefcase, Loader2, ArrowLeft } from 'lucide-react';
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
          toast({ title: 'Welcome back!', description: 'You have successfully signed in.' });
          navigate('/');
        }
      } else {
        if (!fullName.trim()) {
          toast({ title: 'Name required', description: 'Please enter your full name.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) {
          toast({
            title: error.message?.includes('already registered') ? 'Account exists' : 'Sign up failed',
            description: error.message?.includes('already registered') 
              ? 'This email is already registered. Please sign in instead.'
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome to ServiceHub!',
            description: selectedRole === 'provider' ? 'Your provider account is pending approval.' : 'Your account has been created.',
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileLayout className="flex flex-col justify-center" noPadding>
      <div className="relative min-h-screen">
        {/* Gradient Background */}
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-header -z-10" />
        
        <div className="flex-1 flex flex-col justify-center px-6 safe-top min-h-screen">
          {/* Back button for signup */}
          {mode === 'signup' && (
            <button 
              onClick={() => setMode('signin')}
              className="w-11 h-11 rounded-full bg-card shadow-md flex items-center justify-center touch-scale mb-8"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
            </button>
          )}

          {/* Logo/Brand */}
          <div className="mb-10 animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-lg mb-6">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <h1 className="text-heading text-foreground">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === 'signin' ? 'Sign in to continue to ServiceHub' : 'Sign up to get started with ServiceHub'}
            </p>
          </div>

          {/* Role Selection for Signup */}
          {mode === 'signup' && (
            <div className="mb-8 animate-fade-up stagger-1">
              <Label className="text-sm font-semibold mb-4 block">I want to</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole('customer')}
                  className={cn(
                    "flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-200",
                    selectedRole === 'customer'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-3",
                    selectedRole === 'customer' ? "bg-primary text-primary-foreground" : "bg-secondary"
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
                    "flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-200",
                    selectedRole === 'provider'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-3",
                    selectedRole === 'provider' ? "bg-primary text-primary-foreground" : "bg-secondary"
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
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up stagger-2">
            {mode === 'signup' && (
              <div>
                <Label htmlFor="fullName" className="text-sm font-semibold">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-2 h-14 rounded-2xl px-5 text-base border-border bg-secondary/50 focus:bg-background"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 h-14 rounded-2xl px-5 text-base border-border bg-secondary/50 focus:bg-background"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 rounded-2xl px-5 pr-14 text-base border-border bg-secondary/50 focus:bg-background"
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

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl text-base font-semibold bg-foreground text-background hover:bg-foreground/90 touch-scale"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-8 text-center animate-fade-up stagger-3">
            <p className="text-muted-foreground">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-foreground font-semibold mt-2"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
