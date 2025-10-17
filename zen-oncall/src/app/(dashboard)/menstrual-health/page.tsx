// src/app/(dashboard)/menstrual-health/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Heart, Activity, Sparkles, TrendingUp } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';

type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

type MenstrualLog = {
  id: number;
  user_id: string;
  log_date: string;
  cycle_day: number;
  flow_level?: string;
  symptoms: string[];
  mood: string;
  energy_level: number;
  notes?: string;
  created_at: string;
};

type CycleData = {
  id: number;
  user_id: string;
  cycle_start_date: string;
  cycle_length: number;
  period_length: number;
  predicted_next_period?: string;
  created_at: string;
};

export default function MenstrualHealthPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [currentCycle, setCurrentCycle] = useState<CycleData | null>(null);
  const [recentLogs, setRecentLogs] = useState<MenstrualLog[]>([]);
  
  // Log form state
  const [flowLevel, setFlowLevel] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<string>('');
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const symptomOptions = [
    '🤕 Cramps',
    '😩 Headache',
    '🤢 Nausea',
    '😴 Fatigue',
    '🥴 Bloating',
    '😢 Mood Swings',
    '🔥 Hot Flashes',
    '🍔 Cravings',
    '😣 Back Pain',
    '💤 Insomnia',
    '😰 Anxiety',
    '🌊 Heavy Flow',
  ];

  useEffect(() => {
    fetchCycleData();
    fetchRecentLogs();
  }, []);

  const fetchCycleData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('menstrual_cycles')
      .select('*')
      .eq('user_id', user.id)
      .order('cycle_start_date', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setCurrentCycle(data);
    }
    setLoading(false);
  };

  const fetchRecentLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('menstrual_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(30);

    if (data) {
      setRecentLogs(data);
    }
  };

  const getCurrentPhase = (): CyclePhase => {
    if (!currentCycle) return 'menstrual';
    
    const daysSinceStart = differenceInDays(new Date(), new Date(currentCycle.cycle_start_date));
    const cycleDay = (daysSinceStart % currentCycle.cycle_length) + 1;

    if (cycleDay <= currentCycle.period_length) return 'menstrual';
    if (cycleDay <= 13) return 'follicular';
    if (cycleDay <= 17) return 'ovulation';
    return 'luteal';
  };

  const getCurrentCycleDay = (): number => {
    if (!currentCycle) return 1;
    const daysSinceStart = differenceInDays(new Date(), new Date(currentCycle.cycle_start_date));
    return (daysSinceStart % currentCycle.cycle_length) + 1;
  };

  const getPredictedNextPeriod = (): string => {
    if (!currentCycle) return 'N/A';
    const lastStart = new Date(currentCycle.cycle_start_date);
    const nextPeriod = addDays(lastStart, currentCycle.cycle_length);
    return format(nextPeriod, 'MMM dd, yyyy');
  };

  const getPhaseInfo = (phase: CyclePhase) => {
    const phaseData = {
      menstrual: {
        emoji: '🌊',
        color: 'from-red-500 to-pink-500',
        tips: [
          'Rest is crucial - listen to your body',
          'Stay hydrated and eat iron-rich foods',
          'Gentle movement like walking or yoga can help',
          'Use heat therapy for cramps',
        ],
      },
      follicular: {
        emoji: '🌱',
        color: 'from-green-500 to-emerald-500',
        tips: [
          'Energy levels are rising - great time for intense workouts',
          'Try new activities or start new projects',
          'Focus on protein-rich foods',
          'Social activities may feel more enjoyable',
        ],
      },
      ovulation: {
        emoji: '✨',
        color: 'from-yellow-500 to-orange-500',
        tips: [
          'Peak energy and mood - make the most of it!',
          'Communication skills are enhanced',
          'Great time for important conversations',
          'Stay mindful of increased confidence',
        ],
      },
      luteal: {
        emoji: '🌙',
        color: 'from-purple-500 to-violet-500',
        tips: [
          'Practice self-care as energy may dip',
          'Complex carbs can help with cravings',
          'Prioritize sleep and rest',
          'Gentle exercise like stretching helps',
        ],
      },
    };
    return phaseData[phase];
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const cycleDay = getCurrentCycleDay();

    const { error } = await supabase.from('menstrual_logs').insert({
      user_id: user.id,
      log_date: format(new Date(), 'yyyy-MM-dd'),
      cycle_day: cycleDay,
      flow_level: flowLevel || null,
      symptoms: selectedSymptoms,
      mood: mood,
      energy_level: energyLevel,
      notes: notes || null,
    });

    if (!error) {
      // Reset form
      setFlowLevel('');
      setSelectedSymptoms([]);
      setMood('');
      setEnergyLevel(3);
      setNotes('');
      
      // Refresh logs
      await fetchRecentLogs();
      alert('✅ Daily log saved successfully!');
    } else {
      alert('❌ Error saving log. Please try again.');
    }

    setIsSaving(false);
  };

  const handleStartNewCycle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('menstrual_cycles').insert({
      user_id: user.id,
      cycle_start_date: format(new Date(), 'yyyy-MM-dd'),
      cycle_length: 28, // Default, user can update
      period_length: 5, // Default, user can update
    });

    if (!error) {
      await fetchCycleData();
      alert('🎉 New cycle started! You can update cycle length in settings.');
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading cycle data...</div>;
  }

  const currentPhase = getCurrentPhase();
  const phaseInfo = getPhaseInfo(currentPhase);
  const cycleDay = getCurrentCycleDay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Menstrual Health Tracker
          </h1>
          <p className="text-slate-600">Track your cycle, symptoms, and wellness patterns 🌸</p>
        </div>
        {!currentCycle && (
          <Button onClick={handleStartNewCycle} className="bg-gradient-to-r from-pink-500 to-purple-500">
            Start Tracking Cycle
          </Button>
        )}
      </div>

      {currentCycle ? (
        <>
          {/* Current Cycle Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-t-4 border-t-pink-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Cycle Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{cycleDay}</div>
                <p className="text-xs text-slate-500">of {currentCycle.cycle_length}</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Current Phase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize flex items-center gap-2">
                  {phaseInfo.emoji} {currentPhase}
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-violet-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Next Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{getPredictedNextPeriod()}</div>
                <p className="text-xs text-slate-500">Predicted date</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-pink-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{recentLogs.length}</div>
                <p className="text-xs text-slate-500">Last 30 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Phase-Specific Wellness Tips */}
          <Card className={`bg-gradient-to-br ${phaseInfo.color} text-white`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5" />
                Wellness Tips for {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {phaseInfo.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-white/80">•</span>
                    <span className="text-white/90">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Tabs defaultValue="log" className="space-y-4">
            <TabsList>
              <TabsTrigger value="log">Daily Log</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
            </TabsList>

            <TabsContent value="log">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Check-In</CardTitle>
                  <CardDescription>Log your symptoms and how you're feeling</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogSubmit} className="space-y-6">
                    {/* Flow Level */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Flow Level (if applicable)</Label>
                      <div className="flex gap-3 flex-wrap">
                        {['Light', 'Medium', 'Heavy', 'Spotting', 'None'].map((level) => (
                          <Button
                            key={level}
                            type="button"
                            variant={flowLevel === level ? 'default' : 'outline'}
                            onClick={() => setFlowLevel(level)}
                            className={flowLevel === level ? 'bg-pink-500' : ''}
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Symptoms</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {symptomOptions.map((symptom) => (
                          <Button
                            key={symptom}
                            type="button"
                            variant={selectedSymptoms.includes(symptom) ? 'default' : 'outline'}
                            onClick={() => toggleSymptom(symptom)}
                            className={`justify-start ${selectedSymptoms.includes(symptom) ? 'bg-purple-500' : ''}`}
                          >
                            {symptom}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Mood */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Overall Mood</Label>
                      <div className="flex gap-3 flex-wrap">
                        {['😢 Low', '😕 Okay', '😊 Good', '😄 Great', '🤩 Amazing'].map((m) => (
                          <Button
                            key={m}
                            type="button"
                            variant={mood === m ? 'default' : 'outline'}
                            onClick={() => setMood(m)}
                            className={mood === m ? 'bg-violet-500' : ''}
                          >
                            {m}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Energy Level */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Energy Level: {energyLevel}/5</Label>
                      <Input
                        type="range"
                        min="1"
                        max="5"
                        value={energyLevel}
                        onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Additional Notes (Optional)</Label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full min-h-[100px] p-3 border rounded-lg"
                        placeholder="Any other observations or notes..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="w-full h-12 text-lg bg-gradient-to-r from-pink-500 to-purple-500"
                    >
                      {isSaving ? 'Saving...' : '✨ Save Daily Log'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Logs</CardTitle>
                  <CardDescription>Your symptom history over the past month</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentLogs.length > 0 ? (
                    <div className="space-y-4">
                      {recentLogs.map((log) => (
                        <div key={log.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{format(new Date(log.log_date), 'MMMM dd, yyyy')}</p>
                              <p className="text-sm text-slate-500">Cycle Day {log.cycle_day}</p>
                            </div>
                            <div className="flex gap-2">
                              {log.flow_level && (
                                <Badge variant="outline" className="bg-pink-50">{log.flow_level}</Badge>
                              )}
                              <Badge variant="outline" className="bg-purple-50">Energy: {log.energy_level}/5</Badge>
                            </div>
                          </div>
                          {log.mood && (
                            <p className="text-sm mb-2"><strong>Mood:</strong> {log.mood}</p>
                          )}
                          {log.symptoms && log.symptoms.length > 0 && (
                            <div className="flex gap-2 flex-wrap mb-2">
                              {log.symptoms.map((symptom, idx) => (
                                <Badge key={idx} variant="secondary">{symptom}</Badge>
                              ))}
                            </div>
                          )}
                          {log.notes && (
                            <p className="text-sm text-slate-600 italic">{log.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No logs yet. Start tracking today!</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patterns">
              <Card>
                <CardHeader>
                  <CardTitle>Pattern Analysis</CardTitle>
                  <CardDescription>Common symptoms and trends in your cycle</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentLogs.length >= 7 ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Heart className="h-5 w-5 text-pink-500" />
                          Most Common Symptoms
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          {(() => {
                            const symptomCounts: { [key: string]: number } = {};
                            recentLogs.forEach(log => {
                              log.symptoms?.forEach(symptom => {
                                symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                              });
                            });
                            return Object.entries(symptomCounts)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 5)
                              .map(([symptom, count]) => (
                                <Badge key={symptom} className="bg-purple-500">
                                  {symptom} ({count}x)
                                </Badge>
                              ));
                          })()}
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                        <h3 className="font-semibold mb-3">Average Energy by Phase</h3>
                        <p className="text-sm text-slate-600">
                          Track your energy patterns across different cycle phases to optimize your schedule
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">
                      Log at least 7 days to see pattern analysis
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🌸</div>
            <h2 className="text-2xl font-bold mb-2">Start Tracking Your Cycle</h2>
            <p className="text-slate-600 mb-6">
              Begin logging your menstrual health to get personalized wellness tips and insights
            </p>
            <Button onClick={handleStartNewCycle} className="bg-gradient-to-r from-pink-500 to-purple-500">
              Start Your First Cycle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
