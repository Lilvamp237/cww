import { differenceInHours, subDays, startOfDay, differenceInDays } from 'date-fns';
import { FlameIcon, AlertTriangleIcon, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

// Define types
type Shift = { 
  start_time: string; 
  end_time: string; 
};

type MoodLog = { 
  mood_score: number; 
  energy_level: number; 
  log_date: string; 
};

type SleepLog = {
  sleep_hours: number;
  sleep_quality: number;
  log_date: string;
};

type Task = {
  completed: boolean;
  due_date?: string;
};

type BurnoutAnalysis = {
  level: 'Low' | 'Moderate' | 'High' | 'Critical';
  score: number;
  maxScore: number;
  percentage: number;
  color: string;
  icon: any;
  message: string;
  factors: BurnoutFactor[];
  recommendations: Recommendation[];
  trend: 'improving' | 'stable' | 'worsening';
  earlyWarnings: string[];
};

type BurnoutFactor = {
  category: string;
  score: number;
  maxScore: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
};

type Recommendation = {
  priority: 'immediate' | 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  icon: string;
};

/**
 * Enhanced burnout calculation with multiple factors and proactive recommendations
 */
export const calculateBurnoutScore = (
  shifts: Shift[], 
  moodLogs: MoodLog[],
  sleepLogs?: SleepLog[],
  tasks?: Task[],
  previousScore?: number
): BurnoutAnalysis => {
  const factors: BurnoutFactor[] = [];
  const recommendations: Recommendation[] = [];
  const earlyWarnings: string[] = [];
  let totalScore = 0;
  const maxScore = 100;
  
  const sevenDaysAgo = subDays(new Date(), 7);
  const fourteenDaysAgo = subDays(new Date(), 14);
  const today = new Date();

  // ============================================
  // FACTOR 1: WORK HOURS & SCHEDULE (max 25 points)
  // ============================================
  let workScore = 0;
  let totalHoursWorked = 0;
  let nightShifts = 0;
  let doubleShifts = 0;
  let consecutiveDays = 0;
  const workDays = new Set<string>();
  const recentShifts = shifts.filter(s => new Date(s.start_time) >= sevenDaysAgo);

  // Calculate work metrics
  recentShifts.forEach((shift, idx) => {
    const startTime = new Date(shift.start_time);
    const endTime = new Date(shift.end_time);
    const hours = differenceInHours(endTime, startTime);
    
    totalHoursWorked += hours;
    workDays.add(startOfDay(startTime).toISOString());
    
    // Night shift detection (10pm - 6am)
    if (startTime.getHours() >= 22 || endTime.getHours() <= 6) {
      nightShifts++;
    }
    
    // Double shift detection (>12 hours)
    if (hours > 12) {
      doubleShifts++;
    }
    
    // Check for consecutive days
    if (idx > 0) {
      const prevShift = recentShifts[idx - 1];
      const daysDiff = differenceInDays(startTime, new Date(prevShift.start_time));
      if (daysDiff === 1) {
        consecutiveDays++;
      }
    }
  });

  // Scoring for work hours
  if (totalHoursWorked > 60) {
    workScore += 10;
    earlyWarnings.push('Working excessive hours (60+ per week)');
  } else if (totalHoursWorked > 50) {
    workScore += 7;
  } else if (totalHoursWorked > 40) {
    workScore += 4;
  }

  if (nightShifts >= 4) {
    workScore += 8;
    earlyWarnings.push('Multiple night shifts detected');
  } else if (nightShifts >= 2) {
    workScore += 5;
  }

  if (doubleShifts >= 2) {
    workScore += 4;
    earlyWarnings.push('Multiple double shifts (>12 hours)');
  }

  if (workDays.size >= 7) {
    workScore += 3;
    earlyWarnings.push('No days off in the past week');
  }

  totalScore += Math.min(workScore, 25);
  factors.push({
    category: 'Work Load',
    score: workScore,
    maxScore: 25,
    impact: workScore > 18 ? 'critical' : workScore > 12 ? 'high' : workScore > 6 ? 'medium' : 'low',
    description: `${totalHoursWorked}h worked, ${nightShifts} night shifts, ${workDays.size} work days`,
  });

  // ============================================
  // FACTOR 2: EMOTIONAL WELLBEING (max 30 points)
  // ============================================
  let moodScore = 0;
  const recentMoodLogs = moodLogs.filter(log => new Date(log.log_date) >= sevenDaysAgo);
  
  if (recentMoodLogs.length === 0) {
    moodScore += 5; // Not tracking mood is a warning sign
    earlyWarnings.push('No mood tracking in the past week');
  } else {
    const avgMood = recentMoodLogs.reduce((sum, log) => sum + log.mood_score, 0) / recentMoodLogs.length;
    const avgEnergy = recentMoodLogs.reduce((sum, log) => sum + log.energy_level, 0) / recentMoodLogs.length;
    
    // Low mood scoring
    if (avgMood <= 2) {
      moodScore += 15;
      earlyWarnings.push('Consistently low mood scores');
    } else if (avgMood <= 3) {
      moodScore += 10;
    } else if (avgMood <= 3.5) {
      moodScore += 5;
    }

    // Low energy scoring
    if (avgEnergy <= 2) {
      moodScore += 12;
      earlyWarnings.push('Consistently low energy levels');
    } else if (avgEnergy <= 3) {
      moodScore += 7;
    }

    // Mood volatility (big swings)
    const moodVariance = recentMoodLogs.reduce((variance, log) => {
      return variance + Math.abs(log.mood_score - avgMood);
    }, 0) / recentMoodLogs.length;

    if (moodVariance > 1.5) {
      moodScore += 3;
    }
  }

  totalScore += Math.min(moodScore, 30);
  factors.push({
    category: 'Emotional Health',
    score: moodScore,
    maxScore: 30,
    impact: moodScore > 22 ? 'critical' : moodScore > 15 ? 'high' : moodScore > 8 ? 'medium' : 'low',
    description: recentMoodLogs.length > 0 
      ? `Avg mood: ${(recentMoodLogs.reduce((s, l) => s + l.mood_score, 0) / recentMoodLogs.length).toFixed(1)}/5`
      : 'No mood logs',
  });

  // ============================================
  // FACTOR 3: SLEEP QUALITY (max 25 points)
  // ============================================
  let sleepScore = 0;
  const recentSleepLogs = sleepLogs?.filter(log => new Date(log.log_date) >= sevenDaysAgo) || [];
  
  if (recentSleepLogs.length === 0) {
    sleepScore += 5;
  } else {
    const avgSleepHours = recentSleepLogs.reduce((sum, log) => sum + log.sleep_hours, 0) / recentSleepLogs.length;
    const avgSleepQuality = recentSleepLogs.reduce((sum, log) => sum + log.sleep_quality, 0) / recentSleepLogs.length;
    
    // Insufficient sleep
    if (avgSleepHours < 5) {
      sleepScore += 15;
      earlyWarnings.push('Severe sleep deprivation (<5 hours avg)');
    } else if (avgSleepHours < 6) {
      sleepScore += 12;
      earlyWarnings.push('Insufficient sleep (<6 hours avg)');
    } else if (avgSleepHours < 7) {
      sleepScore += 7;
    }

    // Poor sleep quality
    if (avgSleepQuality <= 2) {
      sleepScore += 8;
    } else if (avgSleepQuality <= 3) {
      sleepScore += 4;
    }

    // Inconsistent sleep (check variance)
    const sleepVariance = recentSleepLogs.reduce((variance, log) => {
      return variance + Math.abs(log.sleep_hours - avgSleepHours);
    }, 0) / recentSleepLogs.length;

    if (sleepVariance > 2) {
      sleepScore += 2;
    }
  }

  totalScore += Math.min(sleepScore, 25);
  factors.push({
    category: 'Sleep Health',
    score: sleepScore,
    maxScore: 25,
    impact: sleepScore > 18 ? 'critical' : sleepScore > 12 ? 'high' : sleepScore > 6 ? 'medium' : 'low',
    description: recentSleepLogs.length > 0 
      ? `Avg: ${(recentSleepLogs.reduce((s, l) => s + l.sleep_hours, 0) / recentSleepLogs.length).toFixed(1)}h/night`
      : 'No sleep logs',
  });

  // ============================================
  // FACTOR 4: TASK OVERLOAD (max 10 points)
  // ============================================
  let taskScore = 0;
  const overdueTasks = tasks?.filter(t => !t.completed && t.due_date && new Date(t.due_date) < today) || [];
  const pendingTasks = tasks?.filter(t => !t.completed) || [];
  
  if (overdueTasks.length > 10) {
    taskScore += 6;
  } else if (overdueTasks.length > 5) {
    taskScore += 4;
  } else if (overdueTasks.length > 0) {
    taskScore += 2;
  }

  if (pendingTasks.length > 20) {
    taskScore += 4;
  } else if (pendingTasks.length > 10) {
    taskScore += 2;
  }

  totalScore += Math.min(taskScore, 10);
  factors.push({
    category: 'Task Load',
    score: taskScore,
    maxScore: 10,
    impact: taskScore > 7 ? 'high' : taskScore > 4 ? 'medium' : 'low',
    description: `${overdueTasks.length} overdue, ${pendingTasks.length} pending`,
  });

  // ============================================
  // FACTOR 5: RECOVERY TIME (max 10 points)
  // ============================================
  let recoveryScore = 0;
  const daysSinceLastBreak = calculateDaysSinceLastBreak(shifts);
  
  if (daysSinceLastBreak > 14) {
    recoveryScore += 10;
    earlyWarnings.push('No break in over 2 weeks');
  } else if (daysSinceLastBreak > 10) {
    recoveryScore += 7;
  } else if (daysSinceLastBreak > 7) {
    recoveryScore += 4;
  }

  totalScore += Math.min(recoveryScore, 10);
  factors.push({
    category: 'Recovery Time',
    score: recoveryScore,
    maxScore: 10,
    impact: recoveryScore > 7 ? 'high' : recoveryScore > 4 ? 'medium' : 'low',
    description: `${daysSinceLastBreak} days since last break`,
  });

  // ============================================
  // GENERATE RECOMMENDATIONS
  // ============================================
  
  // Critical recommendations
  if (totalScore >= 70) {
    recommendations.push({
      priority: 'immediate',
      action: 'Consider taking emergency time off',
      reason: 'Your burnout risk is critical. Immediate intervention needed.',
      icon: '🆘',
    });
  }

  // Work-related recommendations
  if (workScore > 15) {
    recommendations.push({
      priority: 'immediate',
      action: 'Reduce work hours this week',
      reason: 'You\'re working excessive hours. Aim for <45 hours/week.',
      icon: '⏰',
    });
  }

  if (nightShifts >= 3) {
    recommendations.push({
      priority: 'high',
      action: 'Request day shifts if possible',
      reason: 'Multiple night shifts disrupt circadian rhythm and increase burnout.',
      icon: '🌙',
    });
  }

  if (consecutiveDays >= 5) {
    recommendations.push({
      priority: 'high',
      action: 'Schedule a day off this week',
      reason: 'Working too many consecutive days without rest.',
      icon: '📅',
    });
  }

  // Sleep recommendations
  if (sleepScore > 10) {
    recommendations.push({
      priority: 'immediate',
      action: 'Prioritize 7-9 hours of sleep tonight',
      reason: 'Sleep deprivation significantly increases burnout risk.',
      icon: '😴',
    });
    
    recommendations.push({
      priority: 'high',
      action: 'Create a consistent bedtime routine',
      reason: 'Regular sleep schedule improves sleep quality and energy.',
      icon: '🌟',
    });
  }

  // Mood recommendations
  if (moodScore > 15) {
    recommendations.push({
      priority: 'immediate',
      action: 'Talk to someone you trust',
      reason: 'Low mood is a key burnout indicator. Social support helps.',
      icon: '💬',
    });
    
    recommendations.push({
      priority: 'high',
      action: 'Consider professional support',
      reason: 'Consistent low mood may benefit from counseling or therapy.',
      icon: '🏥',
    });
  }

  // General self-care
  if (totalScore > 40) {
    recommendations.push({
      priority: 'high',
      action: 'Schedule 30min of self-care daily',
      reason: 'Regular self-care activities reduce stress and prevent burnout.',
      icon: '🧘',
    });
  }

  // Task management
  if (taskScore > 5) {
    recommendations.push({
      priority: 'medium',
      action: 'Delegate or postpone non-urgent tasks',
      reason: 'High task load contributes to overwhelm.',
      icon: '📝',
    });
  }

  // Recovery
  if (recoveryScore > 5) {
    recommendations.push({
      priority: 'high',
      action: 'Plan a vacation or extended break',
      reason: 'You haven\'t had adequate recovery time.',
      icon: '🏖️',
    });
  }

  // Positive reinforcements
  if (totalScore < 30) {
    recommendations.push({
      priority: 'low',
      action: 'Keep up your current balance!',
      reason: 'You\'re managing stress well. Maintain these habits.',
      icon: '✅',
    });
  }

  // ============================================
  // DETERMINE TREND
  // ============================================
  let trend: 'improving' | 'stable' | 'worsening' = 'stable';
  if (previousScore !== undefined) {
    const scoreDiff = totalScore - previousScore;
    if (scoreDiff > 10) {
      trend = 'worsening';
      earlyWarnings.push('Burnout risk increasing rapidly');
    } else if (scoreDiff < -10) {
      trend = 'improving';
    }
  }

  // ============================================
  // DETERMINE RISK LEVEL
  // ============================================
  const percentage = (totalScore / maxScore) * 100;
  let level: 'Low' | 'Moderate' | 'High' | 'Critical';
  let color: string;
  let icon: any;
  let message: string;

  if (totalScore <= 25) {
    level = 'Low';
    color = 'text-green-500';
    icon = CheckCircle2;
    message = "You're maintaining excellent balance! Keep up the great work.";
  } else if (totalScore <= 50) {
    level = 'Moderate';
    color = 'text-yellow-500';
    icon = AlertTriangleIcon;
    message = 'Mild stress detected. Focus on self-care and rest this week.';
  } else if (totalScore <= 75) {
    level = 'High';
    color = 'text-orange-500';
    icon = AlertCircle;
    message = 'High burnout risk! Take immediate action to reduce stress.';
  } else {
    level = 'Critical';
    color = 'text-red-500';
    icon = XCircle;
    message = 'CRITICAL: Burnout imminent. Consider taking time off immediately.';
  }

  return {
    level,
    score: totalScore,
    maxScore,
    percentage,
    color,
    icon,
    message,
    factors,
    recommendations: recommendations.sort((a, b) => {
      const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
    trend,
    earlyWarnings,
  };
};

/**
 * Calculate days since last break (2+ consecutive days off)
 */
function calculateDaysSinceLastBreak(shifts: Shift[]): number {
  if (shifts.length === 0) return 0;

  const sortedShifts = [...shifts].sort((a, b) => 
    new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );

  const today = new Date();
  let consecutiveDaysOff = 0;
  let daysSinceLastBreak = 0;

  for (let i = 0; i < 30; i++) {
    const checkDate = subDays(today, i);
    const hasShift = sortedShifts.some(shift => {
      const shiftDate = startOfDay(new Date(shift.start_time));
      return shiftDate.getTime() === startOfDay(checkDate).getTime();
    });

    if (!hasShift) {
      consecutiveDaysOff++;
      if (consecutiveDaysOff >= 2) {
        return daysSinceLastBreak;
      }
    } else {
      consecutiveDaysOff = 0;
      daysSinceLastBreak = i;
    }
  }

  return daysSinceLastBreak;
}