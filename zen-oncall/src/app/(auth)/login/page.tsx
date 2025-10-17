// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase/client';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-violet-50 p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md shadow-2xl border-t-4 border-t-cyan-500 animate-in fade-in slide-in-from-bottom duration-700">
        <CardHeader className="text-center space-y-4 bg-gradient-to-br from-cyan-50 to-blue-50 pb-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
              <span className="text-5xl">🧘</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Welcome Back! 👋
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Sign in to access your wellness dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-slate-700">Email Address</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">📧</span>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="your.email@hospital.com"
                  className="pl-11 h-12 border-2 border-slate-200 focus:border-cyan-400 focus:ring-cyan-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-slate-700">Password</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">🔒</span>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  className="pl-11 h-12 border-2 border-slate-200 focus:border-cyan-400 focus:ring-cyan-300"
                />
              </div>
            </div>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 animate-in slide-in-from-top duration-300">
                <p className="text-red-600 text-sm font-medium text-center">❌ {error}</p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              🚀 Sign In
            </Button>
            <div className="text-center pt-2">
              <p className="text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-bold text-cyan-600 hover:text-cyan-700 hover:underline">
                  Create Account →
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}