// src/app/(dashboard)/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  BellIcon, 
  BellOffIcon, 
  CheckCircle2, 
  Circle, 
  Trash2Icon,
  CalendarIcon,
  HeartPulseIcon,
  UsersIcon,
  AlertTriangleIcon,
  BriefcaseIcon,
  Loader2Icon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Notification = {
  id: number;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  action_url?: string | null;
  created_at: string;
};

const notificationIcons: Record<string, React.ReactNode> = {
  shift: <CalendarIcon className="w-5 h-5 text-blue-500" />,
  task: <BriefcaseIcon className="w-5 h-5 text-purple-500" />,
  wellness: <HeartPulseIcon className="w-5 h-5 text-pink-500" />,
  fatigue: <AlertTriangleIcon className="w-5 h-5 text-orange-500" />,
  circle: <UsersIcon className="w-5 h-5 text-green-500" />,
  achievement: <CheckCircle2 className="w-5 h-5 text-yellow-500" />,
  reminder: <BellIcon className="w-5 h-5 text-gray-500" />,
};

export default function NotificationsPage() {
  const supabase = createClientComponentClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          
          // Show toast for new notification
          toast(newNotification.title, {
            description: newNotification.message,
            action: newNotification.action_url ? {
              label: 'View',
              onClick: () => window.location.href = newNotification.action_url!,
            } : undefined,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load notifications');
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  const markAsRead = async (id: number) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      toast.error('Failed to mark as read');
    } else {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      toast.error('Failed to mark all as read');
    } else {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      toast.success('All notifications marked as read');
    }
    setMarkingAll(false);
  };

  const deleteNotification = async (id: number) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete notification');
    } else {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    }
  };

  const clearAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
      .eq('read', true);

    if (error) {
      toast.error('Failed to clear notifications');
    } else {
      setNotifications((prev) => prev.filter((n) => !n.read));
      toast.success('Read notifications cleared');
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'all' ? true : !n.read
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your wellness journey
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={markingAll}
            >
              {markingAll ? (
                <>
                  <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark All Read
                </>
              )}
            </Button>
          )}
          <Button variant="outline" onClick={clearAll}>
            <Trash2Icon className="w-4 h-4 mr-2" />
            Clear Read
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {notifications.length - unreadCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
        <TabsList>
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-6">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BellOffIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  You're all caught up! Notifications about shifts, wellness, and team updates will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3 mt-6">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-sm text-muted-foreground">
                  You have no unread notifications.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Notification Card Component
function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const icon = notificationIcons[notification.type] || notificationIcons.reminder;

  return (
    <Card className={`transition-all ${notification.read ? 'opacity-60' : 'border-primary/50'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-full ${notification.read ? 'bg-muted' : 'bg-primary/10'}`}>
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  {notification.title}
                  {!notification.read && (
                    <Badge variant="default" className="text-xs">New</Badge>
                  )}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <Circle className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(notification.id)}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Button */}
            {notification.action_url && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => window.location.href = notification.action_url!}
              >
                View Details →
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
