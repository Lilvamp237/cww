// src/lib/notifications.ts
import { createClientComponentClient } from '@/lib/supabase/client';

export type NotificationType = 
  | 'shift' 
  | 'task' 
  | 'wellness' 
  | 'fatigue' 
  | 'circle' 
  | 'achievement' 
  | 'reminder';

export interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}

/**
 * Send a notification to a user
 * This function checks user preferences before sending
 */
export async function sendNotification(params: SendNotificationParams) {
  const supabase = createClientComponentClient();
  const { userId, type, title, message, actionUrl } = params;

  try {
    // Check if user has this notification type enabled
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Default to enabled if no preferences found
    let isEnabled = true;

    if (prefs) {
      // Check based on notification type
      switch (type) {
        case 'shift':
          isEnabled = prefs.shift_reminders;
          break;
        case 'task':
          isEnabled = prefs.task_reminders;
          break;
        case 'wellness':
        case 'fatigue':
          isEnabled = prefs.wellness_nudges || prefs.fatigue_alerts;
          break;
        case 'circle':
          isEnabled = prefs.circle_notifications;
          break;
        default:
          isEnabled = true;
      }
    }

    // If disabled, don't send
    if (!isEnabled) {
      console.log(`Notification type ${type} is disabled for user ${userId}`);
      return null;
    }

    // Insert notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        action_url: actionUrl,
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error sending notification:', error);
    return null;
  }
}

/**
 * Send a shift reminder notification
 */
export async function sendShiftReminder(
  userId: string,
  shiftTitle: string,
  shiftTime: string,
  shiftId?: number
) {
  return sendNotification({
    userId,
    type: 'shift',
    title: '🚨 Shift Reminder',
    message: `Your shift "${shiftTitle}" starts at ${shiftTime}`,
    actionUrl: shiftId ? `/scheduler?shift=${shiftId}` : '/scheduler',
  });
}

/**
 * Send a fatigue alert
 */
export async function sendFatigueAlert(userId: string, reason: string) {
  return sendNotification({
    userId,
    type: 'fatigue',
    title: '⚠️ Fatigue Alert',
    message: `Fatigue detected: ${reason}. Consider taking a break.`,
    actionUrl: '/wellness-enhanced',
  });
}

/**
 * Send a wellness nudge
 */
export async function sendWellnessNudge(userId: string, message: string) {
  return sendNotification({
    userId,
    type: 'wellness',
    title: '💚 Wellness Reminder',
    message,
    actionUrl: '/wellness-enhanced',
  });
}

/**
 * Send a task reminder
 */
export async function sendTaskReminder(
  userId: string,
  taskTitle: string,
  taskId?: number
) {
  return sendNotification({
    userId,
    type: 'task',
    title: '📋 Task Reminder',
    message: `Task due: "${taskTitle}"`,
    actionUrl: taskId ? `/scheduler?task=${taskId}` : '/scheduler',
  });
}

/**
 * Send a circle notification
 */
export async function sendCircleNotification(
  userId: string,
  circleTitle: string,
  message: string,
  circleId?: number
) {
  return sendNotification({
    userId,
    type: 'circle',
    title: `👥 ${circleTitle}`,
    message,
    actionUrl: circleId ? `/circles/${circleId}` : '/circles',
  });
}

/**
 * Send an achievement notification
 */
export async function sendAchievementNotification(
  userId: string,
  badgeName: string,
  badgeDescription: string
) {
  return sendNotification({
    userId,
    type: 'achievement',
    title: '🏆 New Achievement!',
    message: `You earned: ${badgeName} - ${badgeDescription}`,
    actionUrl: '/achievements',
  });
}

/**
 * Bulk send notifications to multiple users
 */
export async function sendBulkNotifications(
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  actionUrl?: string
) {
  const promises = userIds.map((userId) =>
    sendNotification({ userId, type, title, message, actionUrl })
  );
  
  return Promise.all(promises);
}
