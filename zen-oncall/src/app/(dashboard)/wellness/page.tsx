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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Animated Header */}
      <div className="text-center space-y-2 animate-in slide-in-from-top duration-500">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Mood & Energy Tracker ✨
        </h1>
        <p className="text-lg text-slate-600">Check in daily to track your well-being and identify trends.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-t-4 border-t-violet-500 shadow-lg hover:shadow-2xl transition-all duration-300 animate-in slide-in-from-left duration-700">
          <CardHeader className="bg-gradient-to-br from-violet-50 to-purple-50">
            <CardTitle className="text-2xl text-violet-700">Today&apos;s Check-in 📝</CardTitle>
            <CardDescription className="text-violet-600 font-medium">{format(new Date(), 'PPP')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {hasLoggedToday ? (
              <div className="text-center py-12 space-y-4 animate-in zoom-in duration-500">
                <div className="text-6xl animate-bounce">🎉</div>
                <p className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Thanks for checking in today!
                </p>
                <p className="text-slate-600">Come back tomorrow to log again.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-slate-700">How are you feeling? 💭</label>
                  <div className="flex justify-around pt-2 gap-2">
                    {moodOptions.map(({ score, icon: Icon, label, color }) => (
                      <button 
                        key={score} 
                        onClick={() => setSelectedMood(score)} 
                        className={`text-center p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg ${
                          selectedMood === score 
                            ? 'bg-gradient-to-br from-violet-100 to-purple-100 ring-4 ring-violet-400 scale-110' 
                            : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`h-10 w-10 mx-auto ${color} ${selectedMood === score ? 'animate-bounce' : ''}`} />
                        <span className="text-xs font-medium mt-1 block">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-semibold text-slate-700">What&apos;s your energy level? ⚡</label>
                  <div className="flex items-center justify-between pt-2 space-x-2">
                    <span className="text-xs text-slate-500 font-medium">Low</span>
                    {[1, 2, 3, 4, 5].map(level => (
                      <button 
                        key={level} 
                        onClick={() => setSelectedEnergy(level)} 
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 transform hover:scale-110 ${
                          selectedEnergy === level 
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg scale-110 animate-pulse' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                    <span className="text-xs text-slate-500 font-medium">High</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="journal" className="text-lg font-semibold text-slate-700">Journal (Optional) 📖</label>
                  <Textarea 
                    id="journal" 
                    placeholder="How was your shift? Any thoughts or reflections..." 
                    value={journalEntry} 
                    onChange={(e) => setJournalEntry(e.target.value)}
                    className="min-h-[120px] border-slate-200 focus:border-violet-400 focus:ring-violet-400"
                  />
                </div>
                
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 animate-in slide-in-from-top duration-300">
                    <p className="text-red-600 text-sm font-medium text-center">❌ {error}</p>
                  </div>
                )}
                {successMessage && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 animate-in slide-in-from-top duration-300">
                    <p className="text-emerald-600 text-sm font-medium text-center">✅ {successMessage}</p>
                  </div>
                )}
                
                <Button 
                  onClick={handleSubmitLog} 
                  disabled={loading || !selectedMood || !selectedEnergy} 
                  className="w-full h-12 text-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '💾 Saving...' : '💾 Save Today\'s Log'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-cyan-500 shadow-lg hover:shadow-2xl transition-all duration-300 animate-in slide-in-from-right duration-700">
          <CardHeader className="bg-gradient-to-br from-cyan-50 to-blue-50">
            <CardTitle className="text-2xl text-cyan-700">Recent Logs 📊</CardTitle>
            <CardDescription className="text-cyan-600 font-medium">Your check-ins from the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {recentLogs.length > 0 ? (
              <ul className="space-y-3">
                {recentLogs.map((log, index) => {
                  const mood = moodOptions.find(m => m.score === log.mood_score);
                  return (
                    <li 
                      key={log.id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-in slide-in-from-bottom"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <p className="font-bold text-slate-700">{format(parseISO(log.log_date), 'MMM dd, yyyy')}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm">
                          {mood && <mood.icon className={`h-5 w-5 ${mood.color}`} />}
                          <span className="text-sm font-medium">{mood?.label}</span>
                        </div>
                        <div className="text-sm px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                          ⚡ {log.energy_level}/5
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl opacity-50">📊</div>
                <p className="text-slate-500">No recent logs found. Start by checking in today!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}