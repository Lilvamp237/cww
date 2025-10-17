// src/app/(auth)/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase/client';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <Card className="relative z-10 w-full max-w-md shadow-2xl border-t-4 border-t-emerald-500 animate-in fade-in zoom-in duration-700">
          <CardHeader className="text-center space-y-4 bg-gradient-to-br from-emerald-50 to-teal-50 pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-5xl">📧</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Check Your Email! ✨
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              We&apos;ve sent a confirmation link to <strong className="text-emerald-600">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5 text-sm text-emerald-800 shadow-sm">
              <p className="font-bold text-base mb-3 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Next Steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li className="font-medium">Check your email inbox</li>
                <li className="font-medium">Click the confirmation link</li>
                <li className="font-medium">You&apos;ll be redirected back here</li>
                <li className="font-medium">Start using Zen OnCall! 🎉</li>
              </ol>
            </div>
            <p className="text-sm text-center text-slate-600 bg-slate-50 rounded-lg p-3">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => setSuccess(false)}
                className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold"
              >
                try again →
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Signup Card */}
      <Card className="relative z-10 w-full max-w-md shadow-2xl border-t-4 border-t-violet-500 animate-in fade-in slide-in-from-bottom duration-700">
        <CardHeader className="text-center space-y-4 bg-gradient-to-br from-violet-50 to-purple-50 pb-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <span className="text-5xl">✨</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Create Account 🚀
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Join the Zen OnCall community and start your wellness journey
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSignUp} className="space-y-5">
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
                  className="pl-11 h-12 border-2 border-slate-200 focus:border-violet-400 focus:ring-violet-300"
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
                  minLength={6} 
                  required 
                  placeholder="At least 6 characters"
                  className="pl-11 h-12 border-2 border-slate-200 focus:border-violet-400 focus:ring-violet-300"
                />
              </div>
              <p className="text-xs text-slate-500">Minimum 6 characters required</p>
            </div>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 animate-in slide-in-from-top duration-300">
                <p className="text-red-600 text-sm font-medium text-center">❌ {error}</p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              ✨ Create Account
            </Button>
            <div className="text-center pt-2">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-violet-600 hover:text-violet-700 hover:underline">
                  Sign In →
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}