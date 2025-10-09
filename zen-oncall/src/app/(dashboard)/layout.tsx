// src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { Navbar } from '@/components/navbar';
import { createServerClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Pass user info to the Navbar
  const user = session.user;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}