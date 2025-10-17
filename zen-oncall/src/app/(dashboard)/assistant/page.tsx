// src/app/(dashboard)/assistant/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
};

type UserContext = {
  name: string;
  todayMoodLogged: boolean;
  todaySleepLogged: boolean;
  currentStreak: number;
  recentMood?: number;
  recentEnergy?: number;
  recentSleep?: number;
  upcomingShifts: number;
};

export default function AssistantPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useState<UserContext>({
    name: '',
    todayMoodLogged: false,
    todaySleepLogged: false,
    currentStreak: 0,
    upcomingShifts: 0,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    loadUserContext();
    sendWelcomeMessage();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserContext = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = format(new Date(), 'yyyy-MM-dd');

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Check today's mood
    const { data: moodLog } = await supabase
      .from('mood_logs')
      .select('mood_score, energy_level')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .single();

    // Check today's sleep
    const { data: sleepLog } = await supabase
      .from('sleep_logs')
      .select('sleep_hours')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .single();

    // Get wellness streak
    const { data: wellness } = await supabase
      .from('wellness_points')
      .select('daily_streak')
      .eq('user_id', user.id)
      .single();

    // Get upcoming shifts
    const { data: shifts } = await supabase
      .from('shifts')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('start_time', new Date().toISOString())
      .lte('start_time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    setUserContext({
      name: profile?.full_name?.split(' ')[0] || 'there',
      todayMoodLogged: !!moodLog,
      todaySleepLogged: !!sleepLog,
      currentStreak: wellness?.daily_streak || 0,
      recentMood: moodLog?.mood_score,
      recentEnergy: moodLog?.energy_level,
      recentSleep: sleepLog?.sleep_hours,
      upcomingShifts: shifts?.length || 0,
    });
  };

  const sendWelcomeMessage = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const welcomeMsg: Message = {
      role: 'assistant',
      content: `Hey! 👋 I'm your CareSync wellness assistant. I'm here to help you track your health, manage your schedule, and support your wellbeing. How are you feeling today?`,
      timestamp: new Date(),
      suggestions: [
        "Log my mood",
        "Track my sleep",
        "How's my wellness streak?",
        "What can you help with?"
      ],
    };
    setMessages([welcomeMsg]);
  };

  const generateResponse = async (userMsg: string): Promise<Message> => {
    const msg = userMsg.toLowerCase();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Greeting responses
    if (msg.match(/^(hi|hello|hey|good morning|good evening)/i)) {
      const greetings = [
        `Hey ${userContext.name}! 😊 Great to see you. How can I help you today?`,
        `Hi ${userContext.name}! 🌟 What would you like to do?`,
        `Hello! I'm here to support your wellness journey. What's on your mind?`,
      ];
      return {
        role: 'assistant',
        content: greetings[Math.floor(Math.random() * greetings.length)],
        timestamp: new Date(),
        suggestions: ["Log my mood", "Check my schedule", "Track sleep", "View achievements"],
      };
    }

    // Mood logging
    if (msg.match(/mood|feeling|emotion/i)) {
      if (userContext.todayMoodLogged) {
        return {
          role: 'assistant',
          content: `You already logged your mood today! You rated it ${userContext.recentMood}/5 with energy ${userContext.recentEnergy}/5. That's awesome consistency! 🌟 Keep your ${userContext.currentStreak}-day streak going!`,
          timestamp: new Date(),
          suggestions: ["Track my sleep", "View my progress", "How's my burnout risk?"],
        };
      }

      // Extract mood from message
      const moodKeywords: { [key: string]: number } = {
        'awful': 1, 'terrible': 1, 'horrible': 1,
        'bad': 2, 'down': 2, 'sad': 2, 'stressed': 2,
        'okay': 3, 'fine': 3, 'alright': 3, 'meh': 3,
        'good': 4, 'happy': 4, 'positive': 4,
        'great': 5, 'amazing': 5, 'fantastic': 5, 'excellent': 5,
      };

      let detectedMood = 0;
      for (const [keyword, score] of Object.entries(moodKeywords)) {
        if (msg.includes(keyword)) {
          detectedMood = score;
          break;
        }
      }

      if (detectedMood > 0) {
        // Auto-log the mood
        const today = format(new Date(), 'yyyy-MM-dd');
        await supabase.from('mood_logs').insert({
          user_id: user?.id,
          mood_score: detectedMood,
          energy_level: detectedMood, // Assume similar to mood
          log_date: today,
        });

        const responses = {
          1: "I'm sorry you're feeling rough. Remember, tough days happen to everyone. Have you tried taking a short walk or talking to someone? 💙",
          2: "I hear you - not every day is easy. Want to try a quick breathing exercise or check out some wellness tips?",
          3: "Sounds like you're holding steady! That's good. Anything I can help you with to make today better?",
          4: "That's great! I'm glad you're feeling good. Keep that positive energy going! ✨",
          5: "Wonderful! So happy you're feeling amazing! Let's keep this momentum going! 🎉",
        };

        await loadUserContext(); // Refresh context
        
        return {
          role: 'assistant',
          content: `✅ Mood logged as ${detectedMood}/5! ${responses[detectedMood as keyof typeof responses]}`,
          timestamp: new Date(),
          suggestions: ["Track my sleep", "View wellness tips", "Check achievements", "Log symptoms"],
        };
      }

      return {
        role: 'assistant',
        content: `I'd love to help you log your mood! How are you feeling right now? You can say things like "I'm feeling great" or "Not having a good day" and I'll track it for you. 😊`,
        timestamp: new Date(),
        suggestions: ["I'm feeling great", "Not feeling good", "I'm okay", "Open mood tracker"],
      };
    }

    // Sleep tracking
    if (msg.match(/sleep|slept|tired|exhausted|rest/i)) {
      const hoursMatch = msg.match(/(\d+\.?\d*)\s*hour/i);
      
      if (hoursMatch) {
        const hours = parseFloat(hoursMatch[1]);
        const today = format(new Date(), 'yyyy-MM-dd');
        const quality = hours >= 7 ? 4 : hours >= 6 ? 3 : hours >= 5 ? 2 : 1;
        
        await supabase.from('sleep_logs').insert({
          user_id: user?.id,
          sleep_hours: hours,
          sleep_quality: quality,
          log_date: today,
        });

        const feedback = hours < 6 
          ? `⚠️ That's below the recommended 7-9 hours for healthcare workers. Try to catch up on rest tonight!`
          : hours >= 8 
          ? `🌟 Excellent! You're giving your body the rest it needs.`
          : `✅ Good sleep! Aim for 7-9 hours consistently for best results.`;

        await loadUserContext();
        
        return {
          role: 'assistant',
          content: `Sleep logged: ${hours} hours (quality ${quality}/5). ${feedback}`,
          timestamp: new Date(),
          suggestions: ["Log my mood", "View sleep patterns", "Get sleep tips", "Check energy"],
        };
      }

      if (userContext.todaySleepLogged) {
        return {
          role: 'assistant',
          content: `You logged ${userContext.recentSleep} hours of sleep already. How was your sleep quality? Getting enough rest is crucial for avoiding burnout!`,
          timestamp: new Date(),
          suggestions: ["View sleep history", "Get sleep tips", "Log my mood", "How to sleep better"],
        };
      }

      return {
        role: 'assistant',
        content: `Sleep is super important! How many hours did you sleep last night? Just say something like "I slept 7 hours" and I'll track it. 😴`,
        timestamp: new Date(),
        suggestions: ["I slept 7 hours", "I slept 5 hours", "Didn't sleep well", "Open sleep tracker"],
      };
    }

    // Wellness streak
    if (msg.match(/streak|consistent|progress|doing/i)) {
      const streakMsg = userContext.currentStreak > 0
        ? `🔥 You're on a ${userContext.currentStreak}-day streak! That's amazing dedication to your wellness journey.`
        : `You don't have an active streak yet, but you can start one today! Log your mood or sleep to begin.`;

      const encouragement = userContext.currentStreak >= 7
        ? " You're building incredible healthy habits! Keep it up!"
        : userContext.currentStreak >= 3
        ? " Keep going - you're doing great!"
        : " Every day counts towards a healthier you!";

      return {
        role: 'assistant',
        content: `${streakMsg}${encouragement}`,
        timestamp: new Date(),
        suggestions: ["Log my mood", "Track sleep", "View achievements", "Check my stats"],
      };
    }

    // Schedule and shifts
    if (msg.match(/shift|schedule|work|calendar/i)) {
      const shiftsMsg = userContext.upcomingShifts > 0
        ? `You have ${userContext.upcomingShifts} shifts coming up in the next 7 days.`
        : `No shifts scheduled in the next week.`;

      return {
        role: 'assistant',
        content: `${shiftsMsg} Want to view your full schedule or add a new shift?`,
        timestamp: new Date(),
        suggestions: ["Open scheduler", "Add a shift", "View my shifts", "Request shift swap"],
      };
    }

    // Burnout and stress
    if (msg.match(/burnout|stress|overwhelm|anxious|anxiety/i)) {
      return {
        role: 'assistant',
        content: `I'm here to support you. ${userContext.name}, burnout is serious - especially in healthcare. Let me help you check your burnout risk score and get personalized recommendations. Would you like that?`,
        timestamp: new Date(),
        suggestions: ["Check burnout risk", "Get wellness tips", "Talk to someone", "Practice self-care"],
      };
    }

    // Achievements
    if (msg.match(/achievement|badge|reward|unlock/i)) {
      return {
        role: 'assistant',
        content: `You're making great progress! 🏆 Want to see your achievements and track your wellness journey? I can show you your earned badges and what's coming next!`,
        timestamp: new Date(),
        suggestions: ["View achievements", "Check my level", "See my progress", "What badges can I earn?"],
      };
    }

    // Help and capabilities
    if (msg.match(/help|what can you|how do/i)) {
      return {
        role: 'assistant',
        content: `I can help you with lots of things! Here's what I do best:

🌟 **Track Wellness**: Log mood, sleep, and energy
📅 **Manage Schedule**: View shifts, add tasks, set reminders
🔥 **Monitor Burnout**: Check risk levels and get prevention tips
🏆 **Track Progress**: View achievements and wellness streaks
💡 **Get Recommendations**: Personalized wellness advice
🌸 **Cycle Tracking**: Log menstrual health and symptoms

Just chat naturally with me - I'll understand! What would you like help with?`,
        timestamp: new Date(),
        suggestions: ["Log my mood", "Check my schedule", "View achievements", "Track sleep"],
      };
    }

    // Menstrual health
    if (msg.match(/period|menstrual|cycle|symptoms|cramps/i)) {
      return {
        role: 'assistant',
        content: `I can help you track your menstrual cycle! 🌸 You can log symptoms, flow, mood changes, and get wellness tips for each phase of your cycle. Would you like to access the cycle tracker?`,
        timestamp: new Date(),
        suggestions: ["Open cycle tracker", "Log symptoms", "View cycle tips", "Track my period"],
      };
    }

    // Default conversational response
    return {
      role: 'assistant',
      content: `I'm here to help! I can track your mood, sleep, schedule, and support your wellness journey. Try asking me to:
      
• "Log my mood" or "I'm feeling great"
• "I slept 7 hours" to track sleep
• "Check my schedule" for upcoming shifts
• "How's my streak?" for progress
• "Help" to see everything I can do

What would you like to do?`,
      timestamp: new Date(),
      suggestions: ["Log my mood", "Track sleep", "Check schedule", "View progress"],
    };
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    setInput('');
    setLoading(true);

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate response
    const response = await generateResponse(text);
    setIsTyping(false);
    
    setMessages(prev => [...prev, response]);
    setLoading(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === "Open mood tracker" || suggestion === "Log my mood") {
      router.push('/wellness-enhanced');
    } else if (suggestion === "Open sleep tracker" || suggestion === "Track sleep") {
      router.push('/wellness-enhanced');
    } else if (suggestion === "Open scheduler" || suggestion === "Check my schedule") {
      router.push('/scheduler');
    } else if (suggestion === "View achievements" || suggestion === "Check my level") {
      router.push('/achievements');
    } else if (suggestion === "Check burnout risk") {
      router.push('/burnout');
    } else if (suggestion === "Open cycle tracker") {
      router.push('/menstrual-health');
    } else {
      handleSend(suggestion);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <Card className="mb-4 border-t-4 border-t-gradient-to-r from-cyan-500 to-purple-500">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                CareSync Assistant
              </CardTitle>
              <p className="text-sm text-slate-600">Your AI wellness companion 🤖</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom duration-300`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs hover:bg-cyan-50 hover:border-cyan-400 transition-all"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-slate-400 mt-1">
                  {format(message.timestamp, 'h:mm a')}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 animate-in slide-in-from-bottom duration-300">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="border-t p-4 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message... (e.g., 'I'm feeling great today')"
              className="flex-1 h-12 text-base"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-12 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Tip: Just chat naturally! Say "I slept 7 hours" or "I'm feeling great" 💬
          </p>
        </div>
      </Card>
    </div>
  );
}
