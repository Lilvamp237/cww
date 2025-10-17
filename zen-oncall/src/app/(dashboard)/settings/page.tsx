// src/app/(dashboard)/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

type UserPreferences = {
  id?: number;
  user_id?: string;
  feature_scheduler: boolean;
  feature_circles: boolean;
  feature_wellness: boolean;
  feature_assistant: boolean;
  feature_cycle_tracking: boolean;
  feature_gamification: boolean;
  feature_analytics: boolean;
  theme: string;
  default_view: string;
  calendar_start_day: number;
  profile_visibility: string;
};

type NotificationPreferences = {
  id?: number;
  user_id?: string;
  shift_reminders: boolean;
  shift_reminder_minutes: number;
  task_reminders: boolean;
  wellness_nudges: boolean;
  fatigue_alerts: boolean;
  circle_notifications: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
};

const defaultPreferences: UserPreferences = {
  feature_scheduler: true,
  feature_circles: true,
  feature_wellness: true,
  feature_assistant: true,
  feature_cycle_tracking: false,
  feature_gamification: true,
  feature_analytics: true,
  theme: 'system',
  default_view: 'dashboard',
  calendar_start_day: 0,
  profile_visibility: 'circles',
};

const defaultNotificationPreferences: NotificationPreferences = {
  shift_reminders: true,
  shift_reminder_minutes: 60,
  task_reminders: true,
  wellness_nudges: true,
  fatigue_alerts: true,
  circle_notifications: true,
  push_enabled: false,
  email_enabled: true,
};

export default function SettingsPage() {
  const supabase = createClientComponentClient();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
    fetchNotificationPreferences();
  }, []);

  const fetchPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPreferences(data);
    } else if (!error || error.code === 'PGRST116') {
      // No preferences found, use defaults
      setPreferences(defaultPreferences);
    }
    setLoading(false);
  };

  const fetchNotificationPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setNotificationPrefs(data);
    } else if (!error || error.code === 'PGRST116') {
      setNotificationPrefs(defaultNotificationPreferences);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log('Attempting to save preferences for user:', user?.id);
    
    if (!user) {
      toast.error('You must be logged in to save preferences');
      setSaving(false);
      return;
    }

    const dataToSave = {
      user_id: user.id,
      feature_scheduler: preferences.feature_scheduler,
      feature_circles: preferences.feature_circles,
      feature_wellness: preferences.feature_wellness,
      feature_assistant: preferences.feature_assistant,
      feature_cycle_tracking: preferences.feature_cycle_tracking,
      feature_gamification: preferences.feature_gamification,
      feature_analytics: preferences.feature_analytics,
      theme: preferences.theme,
      default_view: preferences.default_view,
      calendar_start_day: preferences.calendar_start_day,
      profile_visibility: preferences.profile_visibility,
      updated_at: new Date().toISOString(),
    };
    
    console.log('Data to save:', dataToSave);

    const { error, data } = await supabase
      .from('user_preferences')
      .upsert(dataToSave)
      .select();
      
    console.log('Save result:', { data, error });

    if (error) {
      const errorMsg = error.message || error.hint || error.details || JSON.stringify(error);
      toast.error(`Failed to save preferences: ${errorMsg}`);
      console.error('Save preferences error:', {
        message: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code,
        fullError: error
      });
    } else {
      // Also update cycle_tracking table if cycle tracking was enabled/disabled
      if (preferences.feature_cycle_tracking !== undefined) {
        const { error: cycleError } = await supabase
          .from('cycle_tracking')
          .upsert({
            user_id: user.id,
            tracking_enabled: preferences.feature_cycle_tracking,
            cycle_length: 28,
            period_length: 5,
          });
        
        if (cycleError) {
          console.error('Cycle tracking sync error:', cycleError);
        }
      }
      toast.success('Preferences saved successfully!');
    }
    setSaving(false);
  };

  const saveNotificationPreferences = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to save preferences');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        shift_reminders: notificationPrefs.shift_reminders,
        shift_reminder_minutes: notificationPrefs.shift_reminder_minutes,
        task_reminders: notificationPrefs.task_reminders,
        wellness_nudges: notificationPrefs.wellness_nudges,
        fatigue_alerts: notificationPrefs.fatigue_alerts,
        circle_notifications: notificationPrefs.circle_notifications,
        push_enabled: notificationPrefs.push_enabled,
        email_enabled: notificationPrefs.email_enabled,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      toast.error(`Failed to save notification preferences: ${error.message}`);
      console.error('Save notification preferences error:', error);
    } else {
      toast.success('Notification preferences saved!');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your app preferences and features</p>
      </div>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features">Feature Toggles</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable features based on your needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="feature-scheduler">Smart Scheduler</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage shifts, tasks, and habits
                  </p>
                </div>
                <Switch
                  id="feature-scheduler"
                  checked={preferences.feature_scheduler}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences({ ...preferences, feature_scheduler: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="feature-circles">Sync Circles</Label>
                  <p className="text-sm text-muted-foreground">
                    Team collaboration and shift coordination
                  </p>
                </div>
                <Switch
                  id="feature-circles"
                  checked={preferences.feature_circles}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences({ ...preferences, feature_circles: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="feature-wellness">Wellness Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Mood, energy, and sleep logging
                  </p>
                </div>
                <Switch
                  id="feature-wellness"
                  checked={preferences.feature_wellness}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences({ ...preferences, feature_wellness: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="feature-assistant">AI Assistant</Label>
                  <p className="text-sm text-muted-foreground">
                    Conversational wellness companion
                  </p>
                </div>
                <Switch
                  id="feature-assistant"
                  checked={preferences.feature_assistant}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences({ ...preferences, feature_assistant: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="feature-cycle">Cycle Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Menstrual cycle awareness features
                  </p>
                </div>
                <Switch
                  id="feature-cycle"
                  checked={preferences.feature_cycle_tracking}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences({ ...preferences, feature_cycle_tracking: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="feature-gamification">Gamification</Label>
                  <p className="text-sm text-muted-foreground">
                    Badges, challenges, and wellness points
                  </p>
                </div>
                <Switch
                  id="feature-gamification"
                  checked={preferences.feature_gamification}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences({ ...preferences, feature_gamification: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="feature-analytics">Analytics Dashboard</Label>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive wellness insights
                  </p>
                </div>
                <Switch
                  id="feature-analytics"
                  checked={preferences.feature_analytics}
                  onCheckedChange={(checked: boolean) =>
                    setPreferences({ ...preferences, feature_analytics: checked })
                  }
                />
              </div>

              <Button onClick={savePreferences} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Feature Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="shift-reminders">Shift Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded before your shifts start
                  </p>
                </div>
                <Switch
                  id="shift-reminders"
                  checked={notificationPrefs.shift_reminders}
                  onCheckedChange={(checked: boolean) =>
                    setNotificationPrefs({ ...notificationPrefs, shift_reminders: checked })
                  }
                />
              </div>

              {notificationPrefs.shift_reminders && (
                <div className="ml-6">
                  <Label htmlFor="reminder-time">Reminder Time (minutes before shift)</Label>
                  <Select
                    value={notificationPrefs.shift_reminder_minutes.toString()}
                    onValueChange={(value) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        shift_reminder_minutes: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger id="reminder-time">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="task-reminders">Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders for upcoming tasks
                  </p>
                </div>
                <Switch
                  id="task-reminders"
                  checked={notificationPrefs.task_reminders}
                  onCheckedChange={(checked: boolean) =>
                    setNotificationPrefs({ ...notificationPrefs, task_reminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="wellness-nudges">Wellness Nudges</Label>
                  <p className="text-sm text-muted-foreground">
                    Smart suggestions for self-care
                  </p>
                </div>
                <Switch
                  id="wellness-nudges"
                  checked={notificationPrefs.wellness_nudges}
                  onCheckedChange={(checked: boolean) =>
                    setNotificationPrefs({ ...notificationPrefs, wellness_nudges: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="fatigue-alerts">Fatigue Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Warnings when burnout risk is high
                  </p>
                </div>
                <Switch
                  id="fatigue-alerts"
                  checked={notificationPrefs.fatigue_alerts}
                  onCheckedChange={(checked: boolean) =>
                    setNotificationPrefs({ ...notificationPrefs, fatigue_alerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="circle-notifications">Circle Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Updates from your sync circles
                  </p>
                </div>
                <Switch
                  id="circle-notifications"
                  checked={notificationPrefs.circle_notifications}
                  onCheckedChange={(checked: boolean) =>
                    setNotificationPrefs({ ...notificationPrefs, circle_notifications: checked })
                  }
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Notification Channels</h3>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-enabled">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Browser push notifications
                    </p>
                  </div>
                  <Switch
                    id="push-enabled"
                    checked={notificationPrefs.push_enabled}
                    onCheckedChange={(checked: boolean) =>
                      setNotificationPrefs({ ...notificationPrefs, push_enabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-enabled">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    id="email-enabled"
                    checked={notificationPrefs.email_enabled}
                    onCheckedChange={(checked: boolean) =>
                      setNotificationPrefs({ ...notificationPrefs, email_enabled: checked })
                    }
                  />
                </div>
              </div>

              <Button onClick={saveNotificationPreferences} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Notification Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>Customize how the app looks and behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="default-view">Default View</Label>
                <Select
                  value={preferences.default_view}
                  onValueChange={(value) => setPreferences({ ...preferences, default_view: value })}
                >
                  <SelectTrigger id="default-view">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="scheduler">Scheduler</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="circles">Circles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="calendar-start">Calendar Start Day</Label>
                <Select
                  value={preferences.calendar_start_day.toString()}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, calendar_start_day: parseInt(value) })
                  }
                >
                  <SelectTrigger id="calendar-start">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={savePreferences} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Display Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your data visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <Select
                  value={preferences.profile_visibility}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, profile_visibility: value })
                  }
                >
                  <SelectTrigger id="profile-visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="circles">Circles Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  Control who can see your profile information
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Data Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your personal data and account
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Export My Data
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </div>

              <Button onClick={savePreferences} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Privacy Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
