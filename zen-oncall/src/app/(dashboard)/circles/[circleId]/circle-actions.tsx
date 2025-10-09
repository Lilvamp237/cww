'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function InviteCodeCard({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  const copyCode = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied('code');
    setTimeout(() => setCopied(null), 2000);
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/circles?invite=${inviteCode}`;
    await navigator.clipboard.writeText(link);
    setCopied('link');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="border-2 border-primary bg-primary/5">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          🔗 Invite Your Team
        </CardTitle>
        <CardDescription className="text-base">
          Share this invite code with colleagues to add them to your circle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-background p-6 rounded-lg border-2 border-dashed border-primary">
          <p className="text-sm text-muted-foreground mb-2 text-center">
            Invite Code
          </p>
          <p className="text-4xl font-mono font-bold text-center tracking-wider select-all">
            {inviteCode}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyCode}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            {copied === 'code' ? '✅ Copied!' : '📋 Copy Code'}
          </button>
          <button
            onClick={copyLink}
            className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium"
          >
            {copied === 'link' ? '✅ Copied!' : '🔗 Copy Link'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
