// src/app/(dashboard)/cycle/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';

type CycleTracking = {
  tracking_enabled: boolean;
  cycle_start_date: string | null;
  cycle_length: number;
  period_length: number;
};

type CycleLog = {
  id: number;
  log_date: string;
  phase: string;
  symptoms: string[];
  notes: string | null;
};

const phaseInfo = {
  menstrual: {
    name: 'Menstrual Phase',
    color: 'bg-red-100 text-red-800',
    emoji: '🌙',
    tips: 'Rest is key. Focus on gentle activities and self-compassion. Iron-rich foods can help.',
  },
  follicular: {
    name: 'Follicular Phase',
    color: 'bg-green-100 text-green-800',
    emoji: '🌱',
    tips: 'Energy is rising! Great time for new projects and challenging workouts.',
  },
  ovulation: {
    name: 'Ovulation',
    color: 'bg-yellow-100 text-yellow-800',
    emoji: '☀️',
    tips: 'Peak energy and focus. Ideal for important meetings and social activities.',
  },
  luteal: {
    name: 'Luteal Phase',
    color: 'bg-purple-100 text-purple-800',
    emoji: '🌒',
    tips: 'Energy may dip. Prioritize self-care, reduce stress, and plan lighter activities.',
  },
};

export default function CyclePage() {
  const supabase = createClientComponentClient();
  const [cycleTracking, setCycleTracking] = useState<CycleTracking>({
    tracking_enabled: false,
    cycle_start_date: null,
    cycle_length: 28,
    period_length: 5,
  });
  const [currentPhase, setCurrentPhase] = useState<string>('follicular');
  const [daysUntilNext, setDaysUntilNext] = useState<number>(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const commonSymptoms = [
    'Cramps', 'Fatigue', 'Headache', 'Mood swings', 'Bloating',
    'Tender breasts', 'Acne', 'Food cravings', 'Irritability', 'Anxiety'
  ];

  useEffect(() => {
    fetchCycleTracking();
  }, []);

  useEffect(() => {
    if (cycleTracking.tracking_enabled && cycleTracking.cycle_start_date) {
      calculateCurrentPhase();
    }
  }, [cycleTracking]);

  const fetchCycleTracking = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch both user preferences and cycle tracking data
    const { data: prefData } = await supabase
      .from('user_preferences')
      .select('feature_cycle_tracking')
      .eq('user_id', user.id)
      .single();

    const { data, error } = await supabase
      .from('cycle_tracking')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setCycleTracking({
        ...data,
        // Sync tracking_enabled with user_preferences
        tracking_enabled: prefData?.feature_cycle_tracking ?? data.tracking_enabled,
      });
    } else if (prefData) {
      // If no cycle_tracking record exists but preference is set, use preference value
      setCycleTracking(prev => ({
        ...prev,
        tracking_enabled: prefData.feature_cycle_tracking,
      }));
    }
    setLoading(false);
  };

  const calculateCurrentPhase = () => {
    if (!cycleTracking.cycle_start_date) return;

    const startDate = parseISO(cycleTracking.cycle_start_date);
    const today = new Date();
    const daysSinceStart = differenceInDays(today, startDate);
    const cycleDay = daysSinceStart % cycleTracking.cycle_length;

    let phase = 'follicular';
    if (cycleDay < cycleTracking.period_length) {
      phase = 'menstrual';
    } else if (cycleDay >= cycleTracking.period_length && cycleDay < 13) {
      phase = 'follicular';
    } else if (cycleDay >= 13 && cycleDay < 17) {
      phase = 'ovulation';
    } else {
      phase = 'luteal';
    }

    setCurrentPhase(phase);

    // Calculate days until next period
    const daysRemaining = cycleTracking.cycle_length - cycleDay;
    setDaysUntilNext(daysRemaining);
  };

  const handleEnableTracking = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const newEnabledState = !cycleTracking.tracking_enabled;

    // Update user preferences
    const { error: prefError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        feature_cycle_tracking: newEnabledState,
        updated_at: new Date().toISOString(),
      });

    // Update cycle tracking settings
    const { error: cycleError } = await supabase
      .from('cycle_tracking')
      .upsert({
        user_id: user.id,
        tracking_enabled: newEnabledState,
        cycle_start_date: cycleTracking.cycle_start_date || today,
        cycle_length: cycleTracking.cycle_length,
        period_length: cycleTracking.period_length,
      });

    if (!prefError && !cycleError) {
      setCycleTracking({
        ...cycleTracking,
        tracking_enabled: newEnabledState,
        cycle_start_date: cycleTracking.cycle_start_date || today,
      });
    }
    setSaving(false);
  };

  const handleUpdateSettings = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('cycle_tracking')
      .upsert({
        user_id: user.id,
        ...cycleTracking,
        last_updated: new Date().toISOString(),
      });

    if (!error) {
      alert('Settings updated successfully!');
      calculateCurrentPhase();
    }
    setSaving(false);
  };

  const handleLogSymptoms = async () => {
    if (symptoms.length === 0 && !notes) return;

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('cycle_logs')
      .upsert({
        user_id: user.id,
        log_date: today,
        phase: currentPhase,
        symptoms,
        notes,
      });

    if (!error) {
      alert('Symptoms logged successfully!');
      setSymptoms([]);
      setNotes('');
    }
    setSaving(false);
  };

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  const phaseData = currentPhase ? phaseInfo[currentPhase as keyof typeof phaseInfo] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cycle Awareness</h1>
        <p className="text-gray-600">Optional menstrual cycle tracking with wellness insights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cycle Tracking</CardTitle>
          <CardDescription>
            Enable cycle awareness to get personalized wellness recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="tracking-enabled">Enable Cycle Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Track your cycle phases for personalized insights
              </p>
            </div>
            <Switch
              id="tracking-enabled"
              checked={cycleTracking.tracking_enabled}
              onCheckedChange={handleEnableTracking}
              disabled={saving}
            />
          </div>

          {cycleTracking.tracking_enabled && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="cycle-length">Average Cycle Length (days)</Label>
                  <Input
                    id="cycle-length"
                    type="number"
                    min="21"
                    max="40"
                    value={cycleTracking.cycle_length}
                    onChange={(e) =>
                      setCycleTracking({
                        ...cycleTracking,
                        cycle_length: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="period-length">Period Length (days)</Label>
                  <Input
                    id="period-length"
                    type="number"
                    min="1"
                    max="10"
                    value={cycleTracking.period_length}
                    onChange={(e) =>
                      setCycleTracking({
                        ...cycleTracking,
                        period_length: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cycle-start">Last Period Start Date</Label>
                <Input
                  id="cycle-start"
                  type="date"
                  value={cycleTracking.cycle_start_date || ''}
                  onChange={(e) =>
                    setCycleTracking({
                      ...cycleTracking,
                      cycle_start_date: e.target.value,
                    })
                  }
                />
              </div>

              <Button onClick={handleUpdateSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Update Settings'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {cycleTracking.tracking_enabled && cycleTracking.cycle_start_date && phaseData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Current Phase</CardTitle>
              <CardDescription>Based on your cycle tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-6xl">{phaseData.emoji}</div>
                <Badge className={phaseData.color}>{phaseData.name}</Badge>
                <p className="text-2xl font-bold">
                  {daysUntilNext} days until next period
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">💡 Phase-Specific Tips:</p>
                  <p className="text-sm">{phaseData.tips}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Log Today's Symptoms</CardTitle>
              <CardDescription>Track how you're feeling during this phase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Common Symptoms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonSymptoms.map((symptom) => (
                    <Button
                      key={symptom}
                      variant={symptoms.includes(symptom) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSymptom(symptom)}
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other observations or feelings..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                onClick={handleLogSymptoms}
                disabled={saving || (symptoms.length === 0 && !notes)}
                className="w-full"
              >
                {saving ? 'Logging...' : 'Log Symptoms'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wellness Recommendations</CardTitle>
              <CardDescription>Personalized tips for your current phase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentPhase === 'menstrual' && (
                  <>
                    <div className="flex gap-2">
                      <span>🛌</span>
                      <p className="text-sm">Schedule lighter shifts if possible during this phase</p>
                    </div>
                    <div className="flex gap-2">
                      <span>🫖</span>
                      <p className="text-sm">Hot tea and warm compresses can help with cramps</p>
                    </div>
                    <div className="flex gap-2">
                      <span>🥗</span>
                      <p className="text-sm">Focus on iron-rich foods like spinach and lean meats</p>
                    </div>
                  </>
                )}
                {currentPhase === 'follicular' && (
                  <>
                    <div className="flex gap-2">
                      <span>💪</span>
                      <p className="text-sm">Great time for challenging workouts and new habits</p>
                    </div>
                    <div className="flex gap-2">
                      <span>🎯</span>
                      <p className="text-sm">Tackle complex tasks - your focus is at its peak</p>
                    </div>
                    <div className="flex gap-2">
                      <span>🤝</span>
                      <p className="text-sm">Consider scheduling team activities or meetings</p>
                    </div>
                  </>
                )}
                {currentPhase === 'ovulation' && (
                  <>
                    <div className="flex gap-2">
                      <span>⚡</span>
                      <p className="text-sm">Peak energy - perfect for intensive shifts</p>
                    </div>
                    <div className="flex gap-2">
                      <span>👥</span>
                      <p className="text-sm">Excellent time for social connection and collaboration</p>
                    </div>
                    <div className="flex gap-2">
                      <span>🎉</span>
                      <p className="text-sm">You may feel more confident - great for presentations</p>
                    </div>
                  </>
                )}
                {currentPhase === 'luteal' && (
                  <>
                    <div className="flex gap-2">
                      <span>🧘</span>
                      <p className="text-sm">Prioritize stress-reduction and self-care activities</p>
                    </div>
                    <div className="flex gap-2">
                      <span>😴</span>
                      <p className="text-sm">Ensure you're getting enough sleep (8+ hours)</p>
                    </div>
                    <div className="flex gap-2">
                      <span>🥤</span>
                      <p className="text-sm">Stay hydrated to reduce bloating</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
