// src/lib/recommendations.ts
import { createClientComponentClient } from '@/lib/supabase/client';

export interface Recommendation {
  id?: number;
  user_id: string;
  type: 'rest' | 'exercise' | 'social' | 'nutrition' | 'sleep' | 'mindfulness' | 'task';
  title: string;
  description: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  action_url?: string;
  expires_at?: string;
}

export interface UserPattern {
  avgMoodAfterNightShift: number;
  avgMoodAfterDayShift: number;
  avgSleepDuration: number;
  avgEnergyLevel: number;
  consecutiveWorkDays: number;
  daysSinceLastBreak: number;
  totalWeeklyHours: number;
  nightShiftCount: number;
  recentMoodTrend: 'improving' | 'stable' | 'declining';
}

/**
 * Analyze user patterns from historical data
 */
export async function analyzeUserPatterns(userId: string): Promise<UserPattern | null> {
  const supabase = createClientComponentClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    // Get shifts from last 30 days
    const { data: shifts } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', thirtyDaysAgo.toISOString())
      .order('start_time', { ascending: true });

    // Get mood logs from last 30 days
    const { data: moodLogs } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', thirtyDaysAgo.toISOString())
      .order('log_date', { ascending: true });

    // Get sleep logs from last 30 days
    const { data: sleepLogs } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', thirtyDaysAgo.toISOString());

    if (!shifts || !moodLogs || !sleepLogs) {
      return null;
    }

    // Calculate patterns
    const nightShifts = shifts.filter((s) => s.shift_type?.toLowerCase() === 'night');
    const dayShifts = shifts.filter((s) => s.shift_type?.toLowerCase() === 'day');

    // Mood after night shifts
    const moodsAfterNightShift = nightShifts
      .map((shift) => {
        const shiftDate = new Date(shift.start_time).toDateString();
        const mood = moodLogs.find((m) => new Date(m.log_date).toDateString() === shiftDate);
        return mood?.mood_score || 0;
      })
      .filter((score) => score > 0);

    // Mood after day shifts
    const moodsAfterDayShift = dayShifts
      .map((shift) => {
        const shiftDate = new Date(shift.start_time).toDateString();
        const mood = moodLogs.find((m) => new Date(m.log_date).toDateString() === shiftDate);
        return mood?.mood_score || 0;
      })
      .filter((score) => score > 0);

    const avgMoodAfterNightShift =
      moodsAfterNightShift.reduce((a, b) => a + b, 0) / (moodsAfterNightShift.length || 1);
    const avgMoodAfterDayShift =
      moodsAfterDayShift.reduce((a, b) => a + b, 0) / (moodsAfterDayShift.length || 1);

    // Sleep patterns
    const avgSleepDuration =
      sleepLogs.reduce((sum, log) => sum + (log.sleep_hours || 0), 0) / (sleepLogs.length || 1);

    // Energy levels
    const avgEnergyLevel =
      moodLogs.reduce((sum, log) => sum + (log.energy_level || 0), 0) / (moodLogs.length || 1);

    // Consecutive work days
    const recentShifts = shifts.filter(
      (s) => new Date(s.start_time) >= sevenDaysAgo
    ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    let consecutiveWorkDays = 0;
    let daysSinceLastBreak = 0;

    if (recentShifts.length > 0) {
      consecutiveWorkDays = 1;
      let lastShiftDate = new Date(recentShifts[recentShifts.length - 1].start_time);
      
      for (let i = recentShifts.length - 2; i >= 0; i--) {
        const currentShiftDate = new Date(recentShifts[i].start_time);
        const daysDiff = Math.floor(
          (lastShiftDate.getTime() - currentShiftDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysDiff === 1) {
          consecutiveWorkDays++;
        } else {
          daysSinceLastBreak = daysDiff;
          break;
        }
        lastShiftDate = currentShiftDate;
      }
    }

    // Weekly hours
    const weeklyShifts = shifts.filter((s) => new Date(s.start_time) >= sevenDaysAgo);
    const totalWeeklyHours = weeklyShifts.reduce((sum, shift) => {
      const start = new Date(shift.start_time);
      const end = new Date(shift.end_time);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    // Mood trend
    const recentMoods = moodLogs.filter((m) => new Date(m.log_date) >= sevenDaysAgo);
    const firstHalfAvg =
      recentMoods
        .slice(0, Math.floor(recentMoods.length / 2))
        .reduce((sum, m) => sum + m.mood_score, 0) /
      (Math.floor(recentMoods.length / 2) || 1);
    const secondHalfAvg =
      recentMoods
        .slice(Math.floor(recentMoods.length / 2))
        .reduce((sum, m) => sum + m.mood_score, 0) /
      (recentMoods.length - Math.floor(recentMoods.length / 2) || 1);

    let recentMoodTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (secondHalfAvg > firstHalfAvg + 0.5) recentMoodTrend = 'improving';
    if (secondHalfAvg < firstHalfAvg - 0.5) recentMoodTrend = 'declining';

    return {
      avgMoodAfterNightShift,
      avgMoodAfterDayShift,
      avgSleepDuration,
      avgEnergyLevel,
      consecutiveWorkDays,
      daysSinceLastBreak,
      totalWeeklyHours,
      nightShiftCount: nightShifts.length,
      recentMoodTrend,
    };
  } catch (error: any) {
    console.error('Error analyzing user patterns:', error?.message || String(error));
    return null;
  }
}

/**
 * Generate personalized recommendations based on patterns
 */
export async function generateRecommendations(userId: string): Promise<Recommendation[]> {
  const patterns = await analyzeUserPatterns(userId);
  if (!patterns) return [];

  const recommendations: Recommendation[] = [];
  const now = new Date();
  const expiresIn24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  // Sleep recommendations
  if (patterns.avgSleepDuration < 6) {
    recommendations.push({
      user_id: userId,
      type: 'sleep',
      title: '😴 Prioritize Sleep Tonight',
      description: `Your average sleep is ${patterns.avgSleepDuration.toFixed(1)} hours. Aim for 7-9 hours tonight.`,
      reason: 'Chronic sleep deprivation detected',
      priority: 'high',
      action_url: '/wellness-enhanced',
      expires_at: expiresIn24h,
    });
  }

  // Rest recommendation after consecutive work days
  if (patterns.consecutiveWorkDays >= 5) {
    recommendations.push({
      user_id: userId,
      type: 'rest',
      title: '🛋️ Schedule a Day Off',
      description: `You've worked ${patterns.consecutiveWorkDays} consecutive days. Your body needs recovery time.`,
      reason: 'Extended work period without break',
      priority: 'high',
      action_url: '/scheduler',
      expires_at: expiresIn24h,
    });
  }

  // Exercise recommendation if mood is declining
  if (patterns.recentMoodTrend === 'declining' && patterns.avgEnergyLevel > 2) {
    recommendations.push({
      user_id: userId,
      type: 'exercise',
      title: '🏃‍♀️ Take a 15-Minute Walk',
      description: 'Your mood has been declining. Light exercise can boost endorphins and improve mental health.',
      reason: 'Declining mood trend detected',
      priority: 'medium',
      action_url: '/wellness-enhanced',
      expires_at: expiresIn24h,
    });
  }

  // Night shift recovery
  if (patterns.nightShiftCount > 2 && patterns.avgMoodAfterNightShift < 3) {
    recommendations.push({
      user_id: userId,
      type: 'rest',
      title: '🌙 Night Shift Recovery Plan',
      description: `You've had ${patterns.nightShiftCount} night shifts recently and your mood averages ${patterns.avgMoodAfterNightShift.toFixed(1)}/5 afterward. Consider requesting day shifts or taking extra rest.`,
      reason: 'Poor recovery after night shifts',
      priority: 'high',
      action_url: '/scheduler',
      expires_at: expiresIn24h,
    });
  }

  // Social connection if working long hours
  if (patterns.totalWeeklyHours > 50) {
    recommendations.push({
      user_id: userId,
      type: 'social',
      title: '👥 Connect with Friends or Family',
      description: `You worked ${Math.round(patterns.totalWeeklyHours)} hours this week. Make time for social connections to prevent isolation.`,
      reason: 'High weekly work hours',
      priority: 'medium',
      action_url: '/circles',
      expires_at: expiresIn24h,
    });
  }

  // Mindfulness if energy is low
  if (patterns.avgEnergyLevel < 2.5) {
    recommendations.push({
      user_id: userId,
      type: 'mindfulness',
      title: '🧘 Try 5-Minute Breathing Exercise',
      description: `Your average energy is ${patterns.avgEnergyLevel.toFixed(1)}/5. A quick mindfulness break can help reset.`,
      reason: 'Low energy levels detected',
      priority: 'medium',
      action_url: '/wellness-enhanced',
      expires_at: expiresIn24h,
    });
  }

  // Nutrition if working long shifts
  if (patterns.totalWeeklyHours > 40) {
    recommendations.push({
      user_id: userId,
      type: 'nutrition',
      title: '🥗 Plan Healthy Meals',
      description: 'Long work hours can lead to poor eating habits. Prep nutritious meals for the week.',
      reason: 'Extended work schedule',
      priority: 'low',
      action_url: '/scheduler',
      expires_at: expiresIn24h,
    });
  }

  // Always add at least one general wellness tip if no specific recommendations
  if (recommendations.length === 0) {
    recommendations.push({
      user_id: userId,
      type: 'mindfulness',
      title: '🌟 Start Your Wellness Journey',
      description: 'Log your mood daily to get personalized recommendations. Track your sleep, work shifts, and energy levels.',
      reason: 'Building your wellness profile',
      priority: 'medium',
      action_url: '/wellness',
      expires_at: expiresIn24h,
    });
    
    recommendations.push({
      user_id: userId,
      type: 'task',
      title: '📅 Schedule Your Week',
      description: 'Add your upcoming shifts and personal tasks to help us identify patterns and optimize your schedule.',
      reason: 'Initial setup',
      priority: 'medium',
      action_url: '/scheduler',
      expires_at: expiresIn24h,
    });
  }

  return recommendations;
}

/**
 * Save recommendations to database
 */
export async function saveRecommendations(recommendations: Recommendation[]): Promise<boolean> {
  const supabase = createClientComponentClient();

  try {
    const { error } = await supabase
      .from('recommendations')
      .insert(recommendations);

    if (error) {
      console.error('Error saving recommendations:', 
        `Message: ${error.message || 'N/A'}, Code: ${error.code || 'N/A'}, Details: ${error.details || 'N/A'}, Hint: ${error.hint || 'N/A'}`
      );
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Unexpected error saving recommendations:', error?.message || String(error));
    return false;
  }
}

/**
 * Get active recommendations for a user
 */
export async function getActiveRecommendations(userId: string): Promise<Recommendation[]> {
  const supabase = createClientComponentClient();

  try {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recommendations:', 
        `Message: ${error.message || 'N/A'}, Code: ${error.code || 'N/A'}, Details: ${error.details || 'N/A'}, Hint: ${error.hint || 'N/A'}`
      );
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error('Unexpected error fetching recommendations:', error?.message || String(error));
    return [];
  }
}
