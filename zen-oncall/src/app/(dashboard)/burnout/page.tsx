// src/app/(dashboard)/burnout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calculateBurnoutScore } from '@/lib/burnout';
import { 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Moon,
  Heart,
  Briefcase,
  ListTodo,
  RefreshCw,
  Info,
  ArrowRight
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useRouter } from 'next/navigation';

type BurnoutData = {
  level: 'Low' | 'Moderate' | 'High' | 'Critical';
  score: number;
  maxScore: number;
  percentage: number;
  color: string;
  icon: any;
  message: string;
  factors: Array<{
    category: string;
    score: number;
    maxScore: number;
    impact: string;
    description: string;
  }>;
  recommendations: Array<{
    priority: 'immediate' | 'high' | 'medium' | 'low';
    action: string;
    reason: string;
    icon: string;
  }>;
  trend: 'improving' | 'stable' | 'worsening';
  earlyWarnings: string[];
};

export default function BurnoutPredictorPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [burnoutData, setBurnoutData] = useState<BurnoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    loadBurnoutAnalysis();
  }, []);

  const loadBurnoutAnalysis = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const sevenDaysAgo = subDays(new Date(), 7);

    // Load all data
    const [shiftsRes, moodRes, sleepRes, tasksRes, previousRes] = await Promise.all([
      supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', sevenDaysAgo.toISOString()),
      
      supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', sevenDaysAgo.toISOString().split('T')[0]),
      
      supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', sevenDaysAgo.toISOString().split('T')[0]),
      
      supabase
        .from('personal_tasks')
        .select('*')
        .eq('user_id', user.id),
      
      supabase
        .from('burnout_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    ]);

    const shifts = shiftsRes.data || [];
    const moodLogs = moodRes.data || [];
    const sleepLogs = sleepRes.data || [];
    const tasks = tasksRes.data || [];
    const previousScoreData = previousRes.data?.score;

    if (previousScoreData) {
      setPreviousScore(previousScoreData);
    }

    // Calculate burnout score
    const analysis = calculateBurnoutScore(
      shifts,
      moodLogs,
      sleepLogs,
      tasks,
      previousScoreData
    );

    setBurnoutData(analysis as BurnoutData);

    // Save current score to database
    await supabase.from('burnout_scores').insert({
      user_id: user.id,
      score: analysis.score,
      level: analysis.level,
      factors: analysis.factors,
      recommendations: analysis.recommendations,
    });

    setLoading(false);
    setLastChecked(new Date());
  };

  const getTrendIcon = () => {
    if (!burnoutData) return null;
    switch (burnoutData.trend) {
      case 'improving':
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      case 'worsening':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'immediate':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Work Load':
        return <Briefcase className="h-5 w-5" />;
      case 'Emotional Health':
        return <Heart className="h-5 w-5" />;
      case 'Sleep Health':
        return <Moon className="h-5 w-5" />;
      case 'Task Load':
        return <ListTodo className="h-5 w-5" />;
      case 'Recovery Time':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Analyzing your burnout risk...</p>
        </div>
      </div>
    );
  }

  if (!burnoutData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Unable to Calculate</CardTitle>
            <CardDescription>We need more data to assess your burnout risk</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please ensure you have:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Logged your mood and energy levels</li>
              <li>Tracked your shifts</li>
              <li>Recorded your sleep hours</li>
            </ul>
            <Button onClick={() => router.push('/wellness-enhanced')}>
              Start Tracking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = burnoutData.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            Burnout Risk Predictor
          </h1>
          <p className="text-gray-600">Comprehensive analysis of your wellness factors</p>
        </div>
        <Button onClick={loadBurnoutAnalysis} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Early Warnings Alert */}
      {burnoutData.earlyWarnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Early Warning Signs Detected:</strong>
            <ul className="list-disc list-inside mt-2">
              {burnoutData.earlyWarnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Score Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className={`h-12 w-12 ${burnoutData.color}`} />
              <div>
                <CardTitle className="text-2xl">
                  Burnout Risk: {burnoutData.level}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  {getTrendIcon()}
                  <span>
                    {burnoutData.trend === 'improving' && 'Improving'}
                    {burnoutData.trend === 'stable' && 'Stable'}
                    {burnoutData.trend === 'worsening' && 'Getting Worse'}
                  </span>
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${burnoutData.color}`}>
                {burnoutData.score}
              </div>
              <div className="text-sm text-muted-foreground">
                out of {burnoutData.maxScore}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={burnoutData.percentage} className="h-3" />
            <p className="text-lg">{burnoutData.message}</p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Last checked: {format(lastChecked, 'MMM dd, yyyy h:mm a')}</span>
              {previousScore && (
                <span>
                  Previous: {previousScore} 
                  {burnoutData.score > previousScore && ' (+' + (burnoutData.score - previousScore) + ')'}
                  {burnoutData.score < previousScore && ' (' + (burnoutData.score - previousScore) + ')'}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-blue-500" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            Action items to reduce your burnout risk, prioritized by urgency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {burnoutData.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="text-2xl">{rec.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                    <h4 className="font-semibold">{rec.action}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Factor Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-6 w-6 text-purple-500" />
            Risk Factor Breakdown
          </CardTitle>
          <CardDescription>
            Detailed analysis of factors contributing to burnout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {burnoutData.factors.map((factor, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(factor.category)}
                    <span className="font-medium">{factor.category}</span>
                    <Badge variant="outline" className={getImpactColor(factor.impact)}>
                      {factor.impact} impact
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold">
                    {factor.score}/{factor.maxScore}
                  </span>
                </div>
                <Progress 
                  value={(factor.score / factor.maxScore) * 100} 
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground">{factor.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Take immediate steps to improve your wellness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col"
              onClick={() => router.push('/wellness-enhanced')}
            >
              <Heart className="h-6 w-6 mb-2" />
              <span className="text-xs">Log Mood</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col"
              onClick={() => router.push('/wellness-enhanced?tab=sleep')}
            >
              <Moon className="h-6 w-6 mb-2" />
              <span className="text-xs">Track Sleep</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col"
              onClick={() => router.push('/scheduler')}
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-xs">View Schedule</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col"
              onClick={() => router.push('/assistant')}
            >
              <Info className="h-6 w-6 mb-2" />
              <span className="text-xs">Get Help</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
