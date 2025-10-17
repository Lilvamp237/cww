// src/components/navbar.tsx
'use client';

import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MenuIcon, CalendarIcon, UsersIcon, HeartPulseIcon, MessageSquare, Activity, Trophy, Settings, AlertTriangle, BellIcon, Sparkles, BarChart3Icon, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface NavbarProps {
  user: User;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Subscribe to real-time notifications
    const channel = supabase
      .channel('unread-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnreadCount = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    
    setUnreadCount(data?.length || 0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: HeartPulseIcon },
    { href: '/scheduler', label: 'Scheduler', icon: CalendarIcon },
    { href: '/wellness-enhanced', label: 'Wellness+', icon: Activity },
    { href: '/menstrual-health', label: 'Cycle Tracker', icon: Heart },
    { href: '/circles', label: 'Circles', icon: UsersIcon },
    { href: '/burnout', label: 'Burnout Risk', icon: AlertTriangle },
    { href: '/recommendations', label: 'For You', icon: Sparkles },
    { href: '/analytics', label: 'Analytics', icon: BarChart3Icon },
    { href: '/assistant', label: 'Assistant', icon: MessageSquare },
    { href: '/achievements', label: 'Achievements', icon: Trophy },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base group">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <HeartPulseIcon className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">CareSync</span>
          </Link>
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="text-slate-600 transition-all hover:text-cyan-600 hover:scale-105 font-medium"
            >
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
              <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
                CareSync
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
            {/* Notifications Button */}
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  {user.email ? user.email[0].toUpperCase() : 'U'}
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/menstrual-health">Cycle Tracking</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
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