// src/app/(dashboard)/wellness-enhanced/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';
import { Smile, Frown, Meh, Laugh, Angry, Moon, AlertTriangle, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

type MoodLog = {
  id: number;
  log_date: string;
  mood_score: number;
  energy_level: number;
  journal_entry?: string | null;
};

type SleepLog = {
  id: number;
  log_date: string;
  sleep_hours: number;
  sleep_quality: number;
  notes?: string | null;
};

type FatigueAlert = {
  id: number;
  alert_date: string;
  severity: string;
  reason: string;
  dismissed: boolean;
};

const moodOptions = [
  { score: 1, icon: Angry, label: 'Awful', color: 'text-red-500' },
  { score: 2, icon: Frown, label: 'Bad', color: 'text-orange-500' },
  { score: 3, icon: Meh, label: 'Okay', color: 'text-yellow-500' },
  { score: 4, icon: Smile, label: 'Good', color: 'text-green-500' },
  { score: 5, icon: Laugh, label: 'Great', color: 'text-blue-500' },
];

export default function WellnessEnhancedPage() {
  const supabase = createClientComponentClient();
  
  // Mood tracking state
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [recentLogs, setRecentLogs] = useState<MoodLog[]>([]);
  
  // Sleep tracking state
  const [sleepHours, setSleepHours] = useState<string>('');
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [sleepNotes, setSleepNotes] = useState('');
  const [recentSleep, setRecentSleep] = useState<SleepLog[]>([]);
  
  // Fatigue alerts state
  const [fatigueAlerts, setFatigueAlerts] = useState<FatigueAlert[]>([]);
  
  // SOS state
  const [sosActive, setSosActive] = useState(false);
  const [sosLocation, setSosLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const hasLoggedMoodToday = recentLogs.some(log => log.log_date === today);
  const hasLoggedSleepToday = recentSleep.some(log => log.log_date === today);

  const fetchRecentLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .order('log_date', { ascending: false })
      .limit(7);

    if (error) {
      console.error('Error fetching mood logs:', error);
    } else {
      setRecentLogs(data || []);
    }
  }, [supabase]);

  const fetchRecentSleep = useCallback(async () => {
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .order('log_date', { ascending: false })
      .limit(7);

    if (error) {
      console.error('Error fetching sleep logs:', error);
    } else {
      setRecentSleep(data || []);
    }
  }, [supabase]);

  const fetchFatigueAlerts = useCallback(async () => {
    const { data, error } = await supabase
      .from('fatigue_alerts')
      .select('*')
      .eq('dismissed', false)
      .order('alert_date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching fatigue alerts:', error);
    } else {
      setFatigueAlerts(data || []);
    }
  }, [supabase]);

  useEffect(() => {
    fetchRecentLogs();
    fetchRecentSleep();
    fetchFatigueAlerts();
  }, [fetchRecentLogs, fetchRecentSleep, fetchFatigueAlerts]);

  const handleSubmitMoodLog = async () => {
    if (!selectedMood || !selectedEnergy) {
      setError('Please select both your mood and energy level.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to submit a log.");
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from('mood_logs').insert({
      mood_score: selectedMood,
      energy_level: selectedEnergy,
      journal_entry: journalEntry,
      log_date: today,
      user_id: user.id,
    });

    if (dbError) {
      if (dbError.code === '23505') {
        setError('You have already logged your mood for today.');
      } else {
        setError(dbError.message);
      }
    } else {
      setSuccessMessage('Your mood log has been saved!');
      setSelectedMood(null);
      setSelectedEnergy(null);
      setJournalEntry('');
      await fetchRecentLogs();
    }
    setLoading(false);
  };

  const handleSubmitSleepLog = async () => {
    if (!sleepHours || !sleepQuality) {
      setError('Please enter sleep hours and quality.');
      return;
    }

    const hours = parseFloat(sleepHours);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      setError('Please enter valid sleep hours (0-24).');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to submit a log.");
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from('sleep_logs').insert({
      sleep_hours: hours,
      sleep_quality: sleepQuality,
      notes: sleepNotes,
      log_date: today,
      user_id: user.id,
    });

    if (dbError) {
      if (dbError.code === '23505') {
        setError('You have already logged your sleep for today.');
      } else {
        setError(dbError.message);
      }
    } else {
      setSuccessMessage('Your sleep log has been saved!');
      setSleepHours('');
      setSleepQuality(null);
      setSleepNotes('');
      await fetchRecentSleep();
      
      // Check for fatigue alert
      if (hours < 6) {
        await createFatigueAlert('high', `Low sleep detected: Only ${hours} hours logged`);
      }
    }
    setLoading(false);
  };

  const createFatigueAlert = async (severity: string, reason: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('fatigue_alerts').insert({
      user_id: user.id,
      severity,
      reason,
    });

    await fetchFatigueAlerts();
  };

  const dismissAlert = async (alertId: number) => {
    await supabase
      .from('fatigue_alerts')
      .update({ dismissed: true, dismissed_at: new Date().toISOString() })
      .eq('id', alertId);

    await fetchFatigueAlerts();
  };

  const handleSOS = async () => {
    if (sosActive) {
      // Deactivate SOS
      setSosActive(false);
      setSosLocation(null);
      return;
    }

    // Get location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setSosLocation(location);
          setSosActive(true);

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Log SOS event
          await supabase.from('sos_logs').insert({
            user_id: user.id,
            location_lat: location.lat,
            location_lng: location.lng,
            notes: 'Emergency assistance requested',
          });

          // Create high priority notification
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'fatigue_alert',
            title: '🚨 SOS Activated',
            message: 'Your emergency alert has been logged. Help resources are available.',
            priority: 'urgent',
          });

          setSuccessMessage('SOS activated! Your location has been logged. Please reach out to support services if needed.');
        },
        (error) => {
          setError('Unable to get location. SOS logged without location data.');
          setSosActive(true);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wellness Center</h1>
          <p className="text-gray-600">Complete wellness tracking with mood, sleep, and fatigue monitoring</p>
        </div>
        <Button
          variant={sosActive ? "destructive" : "outline"}
          size="lg"
          onClick={handleSOS}
          className="gap-2"
        >
          <AlertTriangle className={sosActive ? "animate-pulse" : ""} />
          {sosActive ? 'SOS ACTIVE' : 'SOS Button'}
        </Button>
      </div>

      {/* Fatigue Alerts */}
      {fatigueAlerts.length > 0 && (
        <div className="space-y-2">
          {fatigueAlerts.map((alert) => (
            <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <span className="ml-2">{alert.reason}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)}>
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {sosActive && sosLocation && (
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            <strong>SOS Active</strong> - Location: {sosLocation.lat.toFixed(4)}, {sosLocation.lng.toFixed(4)}
            <div className="mt-2 space-y-1">
              <p className="text-sm">Emergency Resources:</p>
              <p className="text-sm">• National Crisis Hotline: 988</p>
              <p className="text-sm">• Employee Assistance Program: Contact HR</p>
              <p className="text-sm">• Occupational Health: Check hospital directory</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="mood" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mood">Mood & Energy</TabsTrigger>
          <TabsTrigger value="sleep">Sleep Tracking</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="mood" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Mood Check-in</CardTitle>
                <CardDescription>{format(new Date(), 'PPP')}</CardDescription>
              </CardHeader>
              <CardContent>
                {hasLoggedMoodToday ? (
                  <div className="text-center py-12">
                    <p className="text-lg font-semibold text-green-600">Thanks for checking in today!</p>
                    <p className="text-muted-foreground">Come back tomorrow to log again.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="font-semibold">How are you feeling?</label>
                      <div className="flex justify-around pt-2">
                        {moodOptions.map(({ score, icon: Icon, label, color }) => (
                          <button
                            key={score}
                            onClick={() => setSelectedMood(score)}
                            className={`text-center p-2 rounded-lg ${selectedMood === score ? 'bg-muted ring-2 ring-primary' : ''}`}
                          >
                            <Icon className={`h-8 w-8 mx-auto ${color}`} />
                            <span className="text-xs">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold">What&apos;s your energy level?</label>
                      <div className="flex items-center justify-between pt-2 space-x-2">
                        <span className="text-xs text-muted-foreground">Low</span>
                        {[1, 2, 3, 4, 5].map(level => (
                          <button
                            key={level}
                            onClick={() => setSelectedEnergy(level)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedEnergy === level ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                          >
                            {level}
                          </button>
                        ))}
                        <span className="text-xs text-muted-foreground">High</span>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="journal" className="font-semibold">Journal (Optional)</label>
                      <Textarea
                        id="journal"
                        placeholder="How was your shift? Any thoughts?"
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                      />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}
                    
                    <Button
                      onClick={handleSubmitMoodLog}
                      disabled={loading || !selectedMood || !selectedEnergy}
                      className="w-full"
                    >
                      {loading ? 'Saving...' : 'Save Mood Log'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Mood Logs</CardTitle>
                <CardDescription>Your check-ins from the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {recentLogs.length > 0 ? (
                  <ul className="space-y-4">
                    {recentLogs.map(log => {
                      const mood = moodOptions.find(m => m.score === log.mood_score);
                      return (
                        <li key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <p className="font-semibold">{format(parseISO(log.log_date), 'MMM dd, yyyy')}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {mood && <mood.icon className={`h-5 w-5 ${mood.color}`} />}
                              <span className="text-sm">{mood?.label}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Energy:</span> {log.energy_level}/5
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-10">No recent logs found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sleep" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Sleep Log</CardTitle>
                <CardDescription>Track your sleep to monitor fatigue</CardDescription>
              </CardHeader>
              <CardContent>
                {hasLoggedSleepToday ? (
                  <div className="text-center py-12">
                    <Moon className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                    <p className="text-lg font-semibold text-green-600">Sleep logged for today!</p>
                    <p className="text-muted-foreground">Come back tomorrow to log again.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="sleepHours" className="font-semibold">Hours of Sleep</label>
                      <Input
                        id="sleepHours"
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        placeholder="e.g., 7.5"
                        value={sleepHours}
                        onChange={(e) => setSleepHours(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="font-semibold">Sleep Quality</label>
                      <div className="flex items-center justify-between pt-2 space-x-2">
                        <span className="text-xs text-muted-foreground">Poor</span>
                        {[1, 2, 3, 4, 5].map(level => (
                          <button
                            key={level}
                            onClick={() => setSleepQuality(level)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${sleepQuality === level ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                          >
                            {level}
                          </button>
                        ))}
                        <span className="text-xs text-muted-foreground">Great</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="sleepNotes" className="font-semibold">Notes (Optional)</label>
                      <Textarea
                        id="sleepNotes"
                        placeholder="Any sleep disturbances or observations?"
                        value={sleepNotes}
                        onChange={(e) => setSleepNotes(e.target.value)}
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}

                    <Button
                      onClick={handleSubmitSleepLog}
                      disabled={loading || !sleepHours || !sleepQuality}
                      className="w-full"
                    >
                      {loading ? 'Saving...' : 'Save Sleep Log'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Sleep Logs</CardTitle>
                <CardDescription>Your sleep patterns from the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSleep.length > 0 ? (
                  <ul className="space-y-4">
                    {recentSleep.map(log => (
                      <li key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <p className="font-semibold">{format(parseISO(log.log_date), 'MMM dd, yyyy')}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Moon className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-semibold">{log.sleep_hours}h</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Quality:</span> {log.sleep_quality}/5
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-10">No sleep logs found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Complete Wellness History</CardTitle>
              <CardDescription>View all your mood and sleep logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Average Statistics (Last 7 Days)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Avg Mood</p>
                      <p className="text-2xl font-bold">
                        {recentLogs.length > 0
                          ? (recentLogs.reduce((sum, log) => sum + log.mood_score, 0) / recentLogs.length).toFixed(1)
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Avg Energy</p>
                      <p className="text-2xl font-bold">
                        {recentLogs.length > 0
                          ? (recentLogs.reduce((sum, log) => sum + log.energy_level, 0) / recentLogs.length).toFixed(1)
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Avg Sleep</p>
                      <p className="text-2xl font-bold">
                        {recentSleep.length > 0
                          ? (recentSleep.reduce((sum, log) => sum + log.sleep_hours, 0) / recentSleep.length).toFixed(1)
                          : 'N/A'}h
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Sleep Quality</p>
                      <p className="text-2xl font-bold">
                        {recentSleep.length > 0
                          ? (recentSleep.reduce((sum, log) => sum + log.sleep_quality, 0) / recentSleep.length).toFixed(1)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
