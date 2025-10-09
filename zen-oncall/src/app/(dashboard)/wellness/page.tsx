// src/app/(dashboard)/wellness/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';
import { Smile, Frown, Meh, Laugh, Angry } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

// Define a type for our MoodLog object
type MoodLog = {
  id: number;
  log_date: string;
  mood_score: number;
  energy_level: number;
  journal_entry?: string | null;
};

const moodOptions = [
  { score: 1, icon: Angry, label: 'Awful', color: 'text-red-500' },
  { score: 2, icon: Frown, label: 'Bad', color: 'text-orange-500' },
  { score: 3, icon: Meh, label: 'Okay', color: 'text-yellow-500' },
  { score: 4, icon: Smile, label: 'Good', color: 'text-green-500' },
  { score: 5, icon: Laugh, label: 'Great', color: 'text-blue-500' },
];

export default function WellnessPage() {
  const supabase = createClientComponentClient();
  
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [recentLogs, setRecentLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const hasLoggedToday = recentLogs.some(log => log.log_date === today);

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

  useEffect(() => {
    fetchRecentLogs();
  }, [fetchRecentLogs]);

  const handleSubmitLog = async () => {
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

    // 2. Insert the data, INCLUDING the user_id
    const { error: dbError } = await supabase.from('mood_logs').insert({
      mood_score: selectedMood,
      energy_level: selectedEnergy,
      journal_entry: journalEntry,
      log_date: today,
      user_id: user.id, // <-- THE CRUCIAL FIX
    });

    if (dbError) {
      if (dbError.code === '23505') { // Unique constraint violation code
        setError('You have already logged your mood for today.');
      } else {
        setError(dbError.message);
      }
    } else {
      setSuccessMessage('Your log has been saved!');
      setSelectedMood(null);
      setSelectedEnergy(null);
      setJournalEntry('');
      await fetchRecentLogs(); // Refresh the list
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mood & Energy Tracker</h1>
      <p className="text-gray-600">Check in daily to track your well-being and identify trends.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Check-in</CardTitle>
            <CardDescription>{format(new Date(), 'PPP')}</CardDescription>
          </CardHeader>
          <CardContent>
            {hasLoggedToday ? (
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
                      <button key={score} onClick={() => setSelectedMood(score)} className={`text-center p-2 rounded-lg ${selectedMood === score ? 'bg-muted ring-2 ring-primary' : ''}`}>
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
                      <button key={level} onClick={() => setSelectedEnergy(level)} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedEnergy === level ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {level}
                      </button>
                    ))}
                    <span className="text-xs text-muted-foreground">High</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="journal" className="font-semibold">Journal (Optional)</label>
                  <Textarea id="journal" placeholder="How was your shift? Any thoughts?" value={journalEntry} onChange={(e) => setJournalEntry(e.target.value)} />
                </div>
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}
                
                <Button onClick={handleSubmitLog} disabled={loading || !selectedMood || !selectedEnergy} className="w-full">
                  {loading ? 'Saving...' : 'Save Today\'s Log'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
            <CardDescription>Your check-ins from the last 7 days.</CardDescription>
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
              <p className="text-muted-foreground text-center py-10">No recent logs found. Start by checking in today!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}