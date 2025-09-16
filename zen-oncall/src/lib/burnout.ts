import { differenceInHours, subDays, startOfDay } from 'date-fns';
import { FlameIcon, AlertTriangleIcon } from 'lucide-react';

// Define types locally for this function
type Shift = { start_time: string; end_time: string; };
type MoodLog = { mood_score: number; energy_level: number; log_date: string; };

export const calculateBurnoutScore = (shifts: Shift[], moodLogs: MoodLog[]) => {
  let score = 0;
  const sevenDaysAgo = subDays(new Date(), 7);

  // Analyze Shifts from the last 7 days
  let totalHoursWorked = 0;
  let nightShifts = 0;
  const workDays = new Set<string>();

  const recentShifts = shifts.filter(s => new Date(s.start_time) >= sevenDaysAgo);

  recentShifts.forEach(shift => {
    const startTime = new Date(shift.start_time);
    const endTime = new Date(shift.end_time);
    totalHoursWorked += differenceInHours(endTime, startTime);
    workDays.add(startOfDay(startTime).toISOString());
    if (startTime.getHours() >= 22 || endTime.getHours() <= 6) {
      nightShifts++;
    }
  });

  if (totalHoursWorked > 45) score += 5;
  if (nightShifts >= 2) score += 4;
  if (workDays.size >= 6) score += 5;

  // Analyze Mood & Energy from the last 7 days
  const recentMoodLogs = moodLogs.filter(log => new Date(log.log_date) >= sevenDaysAgo);
  recentMoodLogs.forEach(log => {
    if (log.mood_score <= 2) score += 3;
    if (log.energy_level <= 2) score += 2;
  });
  
  // Determine the risk level
  if (score <= 8) {
    return { level: 'Low', color: 'text-green-500', icon: FlameIcon, message: "You're maintaining a good balance!" };
  }
  if (score <= 16) {
    return { level: 'Moderate', color: 'text-yellow-500', icon: AlertTriangleIcon, message: 'Signs of stress are showing. Prioritize rest.' };
  }
  return { level: 'High', color: 'text-red-500', icon: AlertTriangleIcon, message: 'High risk detected. Consider taking a break.' };
};