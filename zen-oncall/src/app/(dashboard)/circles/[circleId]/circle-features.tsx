// Client-side components for circle features
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { createClientComponentClient } from '@/lib/supabase/client';
import { format, parseISO, startOfToday, addDays } from 'date-fns';
import { Calendar, Clock, MessageSquare, RefreshCw, Shield } from 'lucide-react';

type CircleMember = {
  id: string;
  full_name: string | null;
  share_shifts: boolean;
  share_status: boolean;
};

type Shift = {
  id: number;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  notes?: string | null;
  category?: string;
  color?: string;
};

type Announcement = {
  id: number;
  circle_id: number;
  author_id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
  author?: CircleMember;
};

type ShiftSwap = {
  id: number;
  circle_id: number;
  requester_id: string;
  requester_shift_id: number;
  target_user_id?: string | null;
  target_shift_id?: number | null;
  status: string;
  message?: string | null;
  response_message?: string | null;
  created_at: string;
  requester?: CircleMember;
  requester_shift?: Shift;
  target_shift?: Shift;
};

export function CircleFeatures({ circleId, members, currentUserId }: {
  circleId: number;
  members: CircleMember[];
  currentUserId: string;
}) {
  const supabase = createClientComponentClient();

  // State
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [shiftSwaps, setShiftSwaps] = useState<ShiftSwap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);

  // Form states
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState('normal');
  
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);
  const [swapMessage, setSwapMessage] = useState('');
  
  const [shareShifts, setShareShifts] = useState(true);
  const [shareStatus, setShareStatus] = useState(true);

  // Fetch data
  const fetchShifts = async () => {
    // Get shifts for all members who have share_shifts enabled
    const membersWhoShare = members.filter(m => m.share_shifts);
    const userIds = membersWhoShare.map(m => m.id);

    // Only fetch if there are members
    if (userIds.length === 0) {
      setShifts([]);
      return;
    }

    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .in('user_id', userIds)
      .gte('start_time', startOfToday().toISOString())
      .lte('start_time', addDays(startOfToday(), 30).toISOString())
      .order('start_time');

    if (error) {
      console.error('Error fetching shifts:', error);
      setError(error.message);
    } else {
      setShifts(data || []);
    }
  };

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('circle_announcements')
      .select('*')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) setError(error.message);
    else {
      // Enrich with author data
      const enriched = await Promise.all(
        (data || []).map(async (announcement) => {
          const author = members.find(m => m.id === announcement.author_id);
          return { ...announcement, author };
        })
      );
      setAnnouncements(enriched);
    }
  };

  const fetchShiftSwaps = async () => {
    const { data, error } = await supabase
      .from('shift_swaps')
      .select('*')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) setError(error.message);
    else {
      // Enrich with user and shift data
      const enriched = await Promise.all(
        (data || []).map(async (swap) => {
          const requester = members.find(m => m.id === swap.requester_id);
          
          const { data: requesterShift } = await supabase
            .from('shifts')
            .select('*')
            .eq('id', swap.requester_shift_id)
            .single();
          
          let targetShift = null;
          if (swap.target_shift_id) {
            const { data } = await supabase
              .from('shifts')
              .select('*')
              .eq('id', swap.target_shift_id)
              .single();
            targetShift = data;
          }

          return {
            ...swap,
            requester,
            requester_shift: requesterShift,
            target_shift: targetShift,
          };
        })
      );
      setShiftSwaps(enriched);
    }
  };

  const fetchPrivacySettings = async () => {
    const { data } = await supabase
      .from('circle_members')
      .select('share_shifts, share_status')
      .eq('circle_id', circleId)
      .eq('user_id', currentUserId)
      .single();

    if (data) {
      setShareShifts(data.share_shifts ?? true);
      setShareStatus(data.share_status ?? true);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchAnnouncements();
    fetchShiftSwaps();
    fetchPrivacySettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circleId, members]);

  // Handlers
  const handlePostAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Posting announcement:', {
        circle_id: circleId,
        author_id: currentUserId,
        title: announcementTitle,
        content: announcementContent,
        priority: announcementPriority,
      });

      const res = await supabase.from('circle_announcements').insert([
        {
          circle_id: circleId,
          author_id: currentUserId,
          title: announcementTitle,
          content: announcementContent,
          priority: announcementPriority,
        },
      ]);

      console.log('Announcement insert result:', res);

      if (res.error) {
        console.error('Error posting announcement:', res.error);
        setError(`Failed to post announcement: ${res.error.message}`);
      } else {
        setAnnouncementTitle('');
        setAnnouncementContent('');
        setAnnouncementPriority('normal');
        setIsAnnouncementDialogOpen(false);
        await fetchAnnouncements();
      }
    } catch (err) {
      console.error('Unexpected error posting announcement:', err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = async () => {
    if (!selectedShiftId) return;

    setLoading(true);
    const { error } = await supabase.from('shift_swaps').insert([{
      circle_id: circleId,
      requester_id: currentUserId,
      requester_shift_id: selectedShiftId,
      message: swapMessage,
      status: 'pending',
    }]);

    if (error) {
      setError(error.message);
    } else {
      setSelectedShiftId(null);
      setSwapMessage('');
      setIsSwapDialogOpen(false);
      await fetchShiftSwaps();
    }
    setLoading(false);
  };

  const handleRespondToSwap = async (swapId: number, newStatus: 'accepted' | 'declined', responseMessage?: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('shift_swaps')
      .update({
        status: newStatus,
        response_message: responseMessage,
        responded_at: new Date().toISOString(),
      })
      .eq('id', swapId);

    if (error) {
      setError(error.message);
    } else {
      await fetchShiftSwaps();
    }
    setLoading(false);
  };

  const handleUpdatePrivacy = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('circle_members')
      .update({
        share_shifts: shareShifts,
        share_status: shareStatus,
      })
      .eq('circle_id', circleId)
      .eq('user_id', currentUserId);

    if (error) {
      setError(error.message);
    } else {
      setIsPrivacyDialogOpen(false);
      await fetchShifts();
    }
    setLoading(false);
  };

  // Get user's own shifts for swap requests
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  useEffect(() => {
    const fetchMyShifts = async () => {
      const { data } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', currentUserId)
        .gte('start_time', startOfToday().toISOString())
        .order('start_time');
      setMyShifts(data || []);
    };
    fetchMyShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // Group shifts by member
  const shiftsByMember = members.map(member => {
    const memberShifts = shifts.filter(s => s.user_id === member.id);
    return { member, shifts: memberShifts };
  });

  return (
    <div className="space-y-6">
      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Control what you share with your circle</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsPrivacyDialogOpen(true)} variant="outline">
            Manage Privacy
          </Button>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">
            <Calendar className="mr-2 h-4 w-4" /> Schedule
          </TabsTrigger>
          <TabsTrigger value="announcements">
            <MessageSquare className="mr-2 h-4 w-4" /> Announcements
          </TabsTrigger>
          <TabsTrigger value="swaps">
            <RefreshCw className="mr-2 h-4 w-4" /> Shift Swaps
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Schedule (Next 30 Days)</CardTitle>
              <CardDescription>View your team&apos;s upcoming shifts</CardDescription>
            </CardHeader>
            <CardContent>
              {shiftsByMember.filter(sm => sm.shifts.length > 0).length > 0 ? (
                <div className="space-y-6">
                  {shiftsByMember.map(({ member, shifts: memberShifts }) => {
                    if (memberShifts.length === 0) return null;
                    return (
                      <div key={member.id}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-bold text-primary-foreground text-sm">
                            {member.full_name ? member.full_name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="font-semibold">{member.full_name || 'Unnamed User'}</span>
                        </div>
                        <div className="space-y-2 pl-10">
                          {memberShifts.map(shift => (
                            <div
                              key={shift.id}
                              className="p-3 rounded-lg border"
                              style={{ borderLeftWidth: '4px', borderLeftColor: shift.color || '#3b82f6' }}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{shift.title}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {format(parseISO(shift.start_time), 'MMM dd, h:mm a')} - {format(parseISO(shift.end_time), 'h:mm a')}
                                    </span>
                                  </div>
                                  {shift.notes && (
                                    <p className="text-xs text-muted-foreground mt-1">{shift.notes}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming shifts shared yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsAnnouncementDialogOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" /> Post Announcement
            </Button>
          </div>
          
          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map(announcement => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {announcement.title}
                          {announcement.priority !== 'normal' && (
                            <Badge variant={
                              announcement.priority === 'urgent' ? 'destructive' :
                              announcement.priority === 'high' ? 'default' : 'secondary'
                            }>
                              {announcement.priority}
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Posted by {announcement.author?.full_name || 'Unknown'} on {format(parseISO(announcement.created_at), 'PPP')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{announcement.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  No announcements yet. Be the first to post!
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Shift Swaps Tab */}
        <TabsContent value="swaps" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsSwapDialogOpen(true)}>
              <RefreshCw className="mr-2 h-4 w-4" /> Request Swap
            </Button>
          </div>
          
          <div className="space-y-4">
            {shiftSwaps.length > 0 ? (
              shiftSwaps.map(swap => (
                <Card key={swap.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center gap-2">
                        Shift Swap Request
                        <Badge variant={
                          swap.status === 'pending' ? 'default' :
                          swap.status === 'accepted' ? 'default' :
                          'secondary'
                        }>
                          {swap.status}
                        </Badge>
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {format(parseISO(swap.created_at), 'PPP')}
                      </span>
                    </div>
                    <CardDescription>
                      Requested by {swap.requester?.full_name || 'Unknown'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {swap.requester_shift && (
                      <div>
                        <p className="text-sm font-semibold mb-1">Shift to swap:</p>
                        <div className="p-2 rounded border bg-muted/50">
                          <p className="font-medium">{swap.requester_shift.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(swap.requester_shift.start_time), 'MMM dd, h:mm a')} - {format(parseISO(swap.requester_shift.end_time), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    )}
                    {swap.message && (
                      <div>
                        <p className="text-sm font-semibold mb-1">Message:</p>
                        <p className="text-sm text-muted-foreground">{swap.message}</p>
                      </div>
                    )}
                    {swap.response_message && (
                      <div>
                        <p className="text-sm font-semibold mb-1">Response:</p>
                        <p className="text-sm text-muted-foreground">{swap.response_message}</p>
                      </div>
                    )}
                    {swap.status === 'pending' && swap.requester_id !== currentUserId && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleRespondToSwap(swap.id, 'accepted', 'Accepted your swap request')}
                          disabled={loading}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRespondToSwap(swap.id, 'declined', 'Unable to swap at this time')}
                          disabled={loading}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  No swap requests yet. Request a swap when you need coverage!
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Announcement Dialog */}
      <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Announcement</DialogTitle>
            <DialogDescription>Share important information with your circle</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Announcement title"
              />
            </div>
            <div>
              <Label htmlFor="announcement-content">Content</Label>
              <Textarea
                id="announcement-content"
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                placeholder="What would you like to announce?"
                rows={5}
              />
            </div>
            <div>
              <Label htmlFor="announcement-priority">Priority</Label>
              <Select value={announcementPriority} onValueChange={setAnnouncementPriority}>
                <SelectTrigger id="announcement-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePostAnnouncement} disabled={loading}>
              {loading ? 'Posting...' : 'Post Announcement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Swap Dialog */}
      <Dialog open={isSwapDialogOpen} onOpenChange={setIsSwapDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Shift Swap</DialogTitle>
            <DialogDescription>Select a shift you&apos;d like to swap</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="shift-select">Your Shift</Label>
              <Select
                value={selectedShiftId?.toString() || ''}
                onValueChange={(v) => setSelectedShiftId(parseInt(v))}
              >
                <SelectTrigger id="shift-select">
                  <SelectValue placeholder="Select a shift" />
                </SelectTrigger>
                <SelectContent>
                  {myShifts.map(shift => (
                    <SelectItem key={shift.id} value={shift.id.toString()}>
                      {shift.title} - {format(parseISO(shift.start_time), 'MMM dd, h:mm a')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="swap-message">Message (Optional)</Label>
              <Textarea
                id="swap-message"
                value={swapMessage}
                onChange={(e) => setSwapMessage(e.target.value)}
                placeholder="Let your team know why you need to swap..."
                rows={3}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSwapDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRequestSwap} disabled={loading || !selectedShiftId}>
              {loading ? 'Requesting...' : 'Request Swap'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog open={isPrivacyDialogOpen} onOpenChange={setIsPrivacyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privacy Settings</DialogTitle>
            <DialogDescription>Control what you share with your circle members</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Share My Shifts</Label>
                <p className="text-sm text-muted-foreground">Let team members see your schedule</p>
              </div>
              <input
                type="checkbox"
                checked={shareShifts}
                onChange={(e) => setShareShifts(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Share My Status</Label>
                <p className="text-sm text-muted-foreground">Let team members see your availability</p>
              </div>
              <input
                type="checkbox"
                checked={shareStatus}
                onChange={(e) => setShareStatus(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrivacyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdatePrivacy} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
