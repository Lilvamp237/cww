// src/app/auth/confirm/page.tsx
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ConfirmPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Email Confirmed! 🎉
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Your email has been successfully verified. You can now access all features of Zen_OnCall.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What&apos;s Next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Access your personalized dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Create or join sync circles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Track your wellness and burnout levels</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Manage your shift schedules</span>
              </li>
            </ul>
          </div>
          
          <Button asChild className="w-full" size="lg">
            <Link href="/dashboard">
              Go to Dashboard →
            </Link>
          </Button>
          
          <p className="text-center text-sm text-gray-500">
            Need help?{' '}
            <Link href="/dashboard" className="text-blue-600 hover:underline font-medium">
              Contact Support
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
