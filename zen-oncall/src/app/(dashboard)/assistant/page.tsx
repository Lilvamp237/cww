// src/app/(dashboard)/assistant/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic, Square, Sparkles, Calendar, Moon, Heart, CheckCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

type ConversationItem = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action?: {
    type: string;
    label: string;
    data?: any;
  };
};

export default function AssistantPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [userName, setUserName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
        // Auto-submit after voice input
        setTimeout(() => handleSendMessage(transcript), 100);
      };

      recognitionInstance.onerror = () => setListening(false);
      recognitionInstance.onend = () => setListening(false);

      setRecognition(recognitionInstance);
    }

    loadUserData();
    loadConversationHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (profile?.full_name) {
        setUserName(profile.full_name.split(' ')[0]);
      } else {
        setUserName(user.email?.split('@')[0] || 'there');
      }
    }
  };

  const loadConversationHistory = async () => {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(20);

    if (data && !error) {
      const formatted: ConversationItem[] = [];
      data.forEach((msg: any) => {
        formatted.push({
          role: 'user',
          content: msg.message,
          timestamp: msg.created_at,
        });
        formatted.push({
          role: 'assistant',
          content: msg.response,
          timestamp: msg.created_at,
        });
      });
      setConversation(formatted);
    }
  };

  const startListening = () => {
    if (recognition) {
      setListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setListening(false);
    }
  };

  const executeAction = async (action: string, data?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    switch (action) {
      case 'log_mood':
        router.push('/wellness-enhanced');
        break;
      
      case 'add_shift':
        router.push('/scheduler?tab=work');
        break;
      
      case 'log_sleep':
        router.push('/wellness-enhanced?tab=sleep');
        break;
      
      case 'view_achievements':
        router.push('/achievements');
        break;
      
      case 'check_circles':
        router.push('/circles');
        break;

      case 'quick_mood_log':
        if (data?.mood && data?.energy) {
          const today = new Date().toISOString().split('T')[0];
          await supabase.from('mood_logs').insert({
            user_id: user.id,
            mood_score: data.mood,
            energy_level: data.energy,
            log_date: today,
          });
        }
        break;

      case 'quick_task':
        if (data?.task) {
          await supabase.from('personal_tasks').insert({
            user_id: user.id,
            title: data.task,
            priority: 'medium',
            category: 'personal',
          });
        }
        break;
    }
  };

  const processMessage = async (userMessage: string): Promise<{ response: string; action?: any }> => {
    const lowerMessage = userMessage.toLowerCase();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get recent context
    const today = new Date().toISOString().split('T')[0];
    const { data: todayMood } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', user?.id)
      .eq('log_date', today)
      .single();

    const { data: recentSleep } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('log_date', { ascending: false })
      .limit(1)
      .single();

    const { data: wellnessPoints } = await supabase
      .from('wellness_points')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    // Smart intent detection and responses
    
    // MOOD LOGGING
    if (lowerMessage.match(/log.*mood|how.*feeling|feeling (good|bad|great|awful|okay)/i)) {
      if (todayMood) {
        return {
          response: `You've already logged your mood today! You rated it ${todayMood.mood_score}/5 with energy level ${todayMood.energy_level}/5. Great job staying consistent! 🌟`,
        };
      }
      
      // Check for mood in message
      const moodMatch = lowerMessage.match(/(awful|bad|okay|good|great)/i);
      const energyMatch = lowerMessage.match(/energy.*?(\d)/i);
      
      if (moodMatch && energyMatch) {
        const moodMap: any = { awful: 1, bad: 2, okay: 3, good: 4, great: 5 };
        const mood = moodMap[moodMatch[1].toLowerCase()];
        const energy = parseInt(energyMatch[1]);
        
        await executeAction('quick_mood_log', { mood, energy });
        
        return {
          response: `✅ I've logged your mood as ${moodMatch[1]} (${mood}/5) with energy level ${energy}/5. Keep tracking daily to maintain your ${wellnessPoints?.daily_streak || 0}-day streak! 🔥`,
          action: { type: 'logged', label: 'Mood logged successfully' },
        };
      }
      
      return {
        response: `Let's log your mood! I can guide you through it, or you can tell me directly. For example: "I'm feeling good with energy level 4" or click below to go to the wellness page.`,
        action: { type: 'log_mood', label: 'Open Wellness Page' },
      };
    }

    // SLEEP TRACKING
    if (lowerMessage.match(/sleep|slept|tired|exhausted/i)) {
      const hoursMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*hours?/i);
      
      if (hoursMatch) {
        const hours = parseFloat(hoursMatch[1]);
        const quality = hours >= 7 ? 4 : hours >= 6 ? 3 : 2;
        
        const { error } = await supabase.from('sleep_logs').insert({
          user_id: user?.id,
          sleep_hours: hours,
          sleep_quality: quality,
          log_date: today,
        });

        if (!error) {
          const tip = hours < 6 
            ? '⚠️ That\'s below the recommended 7-9 hours. Try to prioritize rest tonight!'
            : hours >= 8 
            ? '🌟 Excellent! You\'re getting great rest.'
            : '✅ Good sleep! Keep it up.';
          
          return {
            response: `I've logged ${hours} hours of sleep for you. ${tip}`,
            action: { type: 'logged', label: 'Sleep logged' },
          };
        }
      }

      if (recentSleep) {
        return {
          response: `Your last sleep log was ${recentSleep.sleep_hours} hours with quality ${recentSleep.sleep_quality}/5. How did you sleep last night? You can say "I slept 7.5 hours" and I'll log it for you.`,
        };
      }

      return {
        response: `Sleep is crucial for wellness! Tell me how many hours you slept, like "I slept 7 hours" and I'll log it for you. Or click below to track it manually.`,
        action: { type: 'log_sleep', label: 'Track Sleep' },
      };
    }

    // TASK CREATION
    if (lowerMessage.match(/add task|create task|remind me|need to/i)) {
      const taskMatch = lowerMessage.match(/(?:add task|create task|remind me to|need to)\s+(.+)/i);
      
      if (taskMatch) {
        const taskTitle = taskMatch[1].trim();
        await executeAction('quick_task', { task: taskTitle });
        
        return {
          response: `✅ Task created: "${taskTitle}". I've added it to your personal task list with medium priority. You can view and edit it in the scheduler!`,
          action: { type: 'logged', label: 'Task created' },
        };
      }

      return {
        response: `Sure! What task would you like to add? Just say "Add task [your task]" or "Remind me to [your task]".`,
      };
    }

    // SHIFT MANAGEMENT
    if (lowerMessage.match(/shift|schedule|work/i)) {
      if (lowerMessage.match(/swap/i)) {
        return {
          response: `To swap shifts: Go to your Circle page → Shift Swaps tab → Request Swap. Select your shift and a teammate will be notified!`,
          action: { type: 'check_circles', label: 'Go to Circles' },
        };
      }

      return {
        response: `I can help with shifts! Want to add a shift? Go to the Scheduler and click "Add Shift". You can set times, colors, and link it to a circle.`,
        action: { type: 'add_shift', label: 'Add Shift' },
      };
    }

    // ACHIEVEMENTS & PROGRESS
    if (lowerMessage.match(/achievement|badge|points|streak|level/i)) {
      const level = wellnessPoints ? Math.floor(wellnessPoints.points / 100) + 1 : 1;
      const streak = wellnessPoints?.daily_streak || 0;
      const points = wellnessPoints?.points || 0;

      return {
        response: `🏆 You're Level ${level} with ${points} wellness points! You have a ${streak}-day streak going. ${streak >= 7 ? 'Amazing dedication! 🔥' : 'Keep logging daily to build your streak!'} Check your achievements page to see all your badges!`,
        action: { type: 'view_achievements', label: 'View Achievements' },
      };
    }

    // BURNOUT & STRESS
    if (lowerMessage.match(/burnout|stressed|overwhelmed|exhausted|can't cope/i)) {
      return {
        response: `I'm sorry you're feeling this way. Here's what can help:\n\n🛌 **Immediate**: Take a 5-minute break, deep breaths\n💤 **Tonight**: Aim for 8+ hours sleep\n📝 **Track**: Log your mood daily to spot patterns\n🤝 **Connect**: Reach out to your circle for support\n🆘 **Emergency**: Use the SOS button on wellness page if you need immediate help\n\nYou're doing important work. Remember to care for yourself too. ❤️`,
        action: { type: 'log_mood', label: 'Log How You Feel' },
      };
    }

    // WELLNESS TIPS
    if (lowerMessage.match(/tip|advice|help|suggest/i)) {
      const tips = [
        `💧 **Hydration Check**: Aim for 8 glasses of water during your shift. Your body needs it!`,
        `🧘 **Micro-Break**: Take 2 minutes every hour to stretch or breathe deeply. Small breaks = big difference.`,
        `📱 **Digital Detox**: Put your phone away 30 minutes before bed for better sleep quality.`,
        `🥗 **Fuel Up**: Eat protein-rich snacks during shifts to maintain energy levels.`,
        `👥 **Connect**: Chat with a colleague today. Social support reduces burnout by 50%!`,
        `😴 **Sleep Hygiene**: Keep your bedroom cool (60-67°F) for optimal sleep.`,
        `🎯 **One Thing**: Choose ONE self-care activity today. Small steps count!`,
        `📊 **Track Progress**: Log your mood daily - awareness is the first step to improvement.`,
      ];

      return {
        response: tips[Math.floor(Math.random() * tips.length)],
      };
    }

    // STATS & ANALYTICS
    if (lowerMessage.match(/stats|how am i doing|progress|summary/i)) {
      const moodCount = wellnessPoints?.total_moods_logged || 0;
      const habitCount = wellnessPoints?.total_habits_completed || 0;
      const sleepCount = wellnessPoints?.total_sleep_logged || 0;

      return {
        response: `📊 **Your Wellness Stats**:\n\n✅ Mood logs: ${moodCount}\n💪 Habits completed: ${habitCount}\n😴 Sleep logs: ${sleepCount}\n🔥 Current streak: ${wellnessPoints?.daily_streak || 0} days\n⭐ Total points: ${wellnessPoints?.points || 0}\n\nYou're making great progress! Keep it up! 🌟`,
        action: { type: 'view_achievements', label: 'See All Stats' },
      };
    }

    // GREETINGS
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good evening)/i)) {
      const greetings = [
        `Hi ${userName}! 👋 How can I support your wellness today?`,
        `Hello ${userName}! Ready to tackle your wellness goals? I'm here to help!`,
        `Hey ${userName}! 😊 What would you like to do today?`,
        `Good to see you, ${userName}! How are you feeling today?`,
      ];

      return {
        response: greetings[Math.floor(Math.random() * greetings.length)],
      };
    }

    // HELP / WHAT CAN YOU DO
    if (lowerMessage.match(/what can you do|help|commands|capabilities/i)) {
      return {
        response: `I'm your wellness companion! Here's what I can do:\n\n💬 **Quick Actions**:\n• "I'm feeling good with energy 4" → Logs mood\n• "I slept 7.5 hours" → Logs sleep\n• "Add task buy groceries" → Creates task\n• "I'm stressed" → Get support\n\n📊 **Info**:\n• "Show my stats" → View progress\n• "How am I doing?" → Get summary\n\n🚀 **Navigate**:\n• "Show achievements" → Your badges\n• "View shifts" → Scheduler\n• "Check circles" → Team page\n\nJust talk naturally - I understand you! 🤖`,
      };
    }

    // DEFAULT: Friendly response with tips
    const responses = [
      `I'm here to help with your wellness journey! Try asking me to log your mood, track sleep, add tasks, or show your progress. What would you like to do?`,
      `I didn't quite catch that, but I'm learning! You can ask me to log your mood, track sleep, check your stats, or get wellness tips. What can I help with?`,
      `Hmm, I'm not sure about that one. But I can help you log mood, track sleep, add tasks, view achievements, or give wellness tips. What sounds good?`,
    ];

    return {
      response: responses[Math.floor(Math.random() * responses.length)],
    };
  };

  const handleSendMessage = async (messageText?: string) => {
    const userMessage = (messageText || input).trim();
    if (!userMessage) return;

    setInput('');
    setLoading(true);

    const newUserMessage: ConversationItem = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setConversation(prev => [...prev, newUserMessage]);

    try {
      const { response, action } = await processMessage(userMessage);

      const assistantMessage: ConversationItem = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        action,
      };
      setConversation(prev => [...prev, assistantMessage]);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_conversations').insert({
          user_id: user.id,
          message: userMessage,
          response: response,
          intent: detectIntent(userMessage),
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ConversationItem = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again!',
        timestamp: new Date().toISOString(),
      };
      setConversation(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const detectIntent = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('mood')) return 'mood_logging';
    if (lowerMessage.match(/achievement|badge|points/)) return 'achievements';
    if (lowerMessage.includes('shift')) return 'shift_management';
    if (lowerMessage.includes('sleep')) return 'sleep_tracking';
    if (lowerMessage.includes('task')) return 'task_management';
    if (lowerMessage.match(/burnout|stress/)) return 'burnout_support';
    return 'general';
  };

  const quickActions = [
    { label: '😊 Log my mood', message: 'I want to log my mood', icon: Heart },
    { label: '😴 Track sleep', message: 'I want to track my sleep', icon: Moon },
    { label: '📅 Add a shift', message: 'Help me add a new shift', icon: Calendar },
    { label: '📊 Show my stats', message: 'Show me my stats', icon: Sparkles },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          AI Wellness Assistant
        </h1>
        <p className="text-gray-600">Your intelligent companion for wellness and productivity</p>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chat with Your Assistant</CardTitle>
              <CardDescription>
                I can log moods, track sleep, add tasks, and more - just ask naturally!
              </CardDescription>
            </div>
            {listening && (
              <Badge variant="destructive" className="animate-pulse">
                🎤 Listening...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {conversation.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-lg font-semibold mb-2">Hi {userName}! How can I help you today?</p>
                <p className="text-muted-foreground mb-6">
                  Try asking me to log your mood, track sleep, or show your progress
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {quickActions.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        className="h-auto py-3"
                        onClick={() => {
                          setInput(action.message);
                          handleSendMessage(action.message);
                        }}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.action && msg.action.type !== 'logged' && (
                        <Button
                          variant={msg.role === 'user' ? 'secondary' : 'default'}
                          size="sm"
                          className="mt-3"
                          onClick={() => executeAction(msg.action!.type, msg.action!.data)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {msg.action.label}
                        </Button>
                      )}
                      {msg.action && msg.action.type === 'logged' && (
                        <Badge variant="secondary" className="mt-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {msg.action.label}
                        </Badge>
                      )}
                      <p className="text-xs mt-2 opacity-70">
                        {format(new Date(msg.timestamp), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type or use voice... (e.g., 'I slept 7 hours' or 'I'm feeling great')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
              disabled={loading}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={listening ? stopListening : startListening}
              disabled={!recognition || loading}
              className={listening ? 'bg-red-50' : ''}
            >
              {listening ? <Square className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button onClick={() => handleSendMessage()} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {recognition && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {listening ? '🎤 Listening... Speak naturally!' : 'Click the microphone or type to chat with me'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
