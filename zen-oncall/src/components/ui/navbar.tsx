// src/components/navbar.tsx
'use client';

import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MenuIcon, CalendarIcon, UsersIcon, HeartPulseIcon } from 'lucide-react'; // Need to install lucide-react

// Install lucide-react for icons: npm install lucide-react
// Also update your tailwind.config.ts for `lucide-react` by adding a safelist entry:
// safelist: [ { pattern: /^(bg|text|border)-(red|green|blue|yellow|indigo|purple|pink|rose|cyan|emerald|teal|orange)-(500|600|700)$/ }, { pattern: /^h-/, variants: ['hover'] }, { pattern: /^w-/, variants: ['hover'] }, ],
// For more details refer to shadcn-ui doc for icons

interface NavbarProps {
  user: User;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: HeartPulseIcon },
    { href: '/scheduler', label: 'Scheduler', icon: CalendarIcon },
    { href: '/wellness', label: 'Wellness', icon: HeartPulseIcon }, // Reusing icon for now
    // { href: '/sync-circles', label: 'Sync Circles', icon: UsersIcon }, // For future
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            CareSync
          </Link>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                Zen_OnCall
              </Link>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  {/* Placeholder for user avatar or initials */}
                  {user.email ? user.email[0].toUpperCase() : 'U'}
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}