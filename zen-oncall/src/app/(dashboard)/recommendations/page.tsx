// src/app/(dashboard)/recommendations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Sparkles,
  BedIcon,
  DumbbellIcon,
  UsersIcon,
  UtensilsIcon,
  BrainIcon,
  ListTodoIcon,
  RefreshCwIcon,
  Loader2Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  ArrowRightIcon,
} from 'lucide-react';
import { 
  generateRecommendations, 
  saveRecommendations, 
  getActiveRecommendations,
  analyzeUserPatterns,
  type Recommendation,
  type UserPattern,
} from '@/lib/recommendations';

const recommendationIcons: Record<string, React.ReactNode> = {
  rest: <BedIcon className="w-6 h-6" />,
  exercise: <DumbbellIcon className="w-6 h-6" />,
  social: <UsersIcon className="w-6 h-6" />,
  nutrition: <UtensilsIcon className="w-6 h-6" />,
  sleep: <BedIcon className="w-6 h-6" />,
  mindfulness: <BrainIcon className="w-6 h-6" />,
  task: <ListTodoIcon className="w-6 h-6" />,
};

const priorityColors = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
} as const;

export default function RecommendationsPage() {
  const supabase = createClientComponentClient();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [patterns, setPatterns] = useState<UserPattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load patterns and recommendations in parallel
    const [patternsData, recsData] = await Promise.all([
      analyzeUserPatterns(user.id),
      getActiveRecommendations(user.id),
    ]);

    setPatterns(patternsData);
    setRecommendations(recsData);
    setLoading(false);
  };

  const handleGenerateRecommendations = async () => {
    setGenerating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const newRecs = await generateRecommendations(user.id);
      
      if (newRecs.length === 0) {
        toast.success('Great job! No new recommendations needed.');
        setGenerating(false);
        return;
      }

      const saved = await saveRecommendations(newRecs);
      
      if (saved) {
        toast.success(`Generated ${newRecs.length} personalized recommendations!`);
        await loadData();
      } else {
        toast.error('Failed to save recommendations');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    }
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            Personal Recommendations
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered wellness suggestions based on your patterns
          </p>
        </div>
        <Button onClick={handleGenerateRecommendations} disabled={generating}>
          {generating ? (
            <>
              <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Generate New
            </>
          )}
        </Button>
      </div>

      {/* Patterns Summary */}
      {patterns && (
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10">
          <CardHeader>
            <CardTitle className="text-lg">Your Patterns (Last 30 Days)</CardTitle>
            <CardDescription>Insights from your wellness data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PatternCard
                label="Avg Sleep"
                value={`${patterns.avgSleepDuration.toFixed(1)}h`}
                status={patterns.avgSleepDuration >= 7 ? 'good' : 'warning'}
              />
              <PatternCard
                label="Avg Energy"
                value={`${patterns.avgEnergyLevel.toFixed(1)}/5`}
                status={patterns.avgEnergyLevel >= 3 ? 'good' : 'warning'}
              />
              <PatternCard
                label="Weekly Hours"
                value={`${Math.round(patterns.totalWeeklyHours)}h`}
                status={patterns.totalWeeklyHours <= 40 ? 'good' : 'warning'}
              />
              <PatternCard
                label="Mood Trend"
                value={patterns.recentMoodTrend}
                status={
                  patterns.recentMoodTrend === 'improving'
                    ? 'good'
                    : patterns.recentMoodTrend === 'declining'
                    ? 'warning'
                    : 'neutral'
                }
                icon={
                  patterns.recentMoodTrend === 'improving' ? (
                    <TrendingUpIcon className="w-4 h-4" />
                  ) : patterns.recentMoodTrend === 'declining' ? (
                    <TrendingDownIcon className="w-4 h-4" />
                  ) : (
                    <MinusIcon className="w-4 h-4" />
                  )
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Your Recommendations ({recommendations.length})
        </h2>

        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active recommendations</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                Click "Generate New" to analyze your recent patterns and get personalized wellness suggestions.
              </p>
              <Button onClick={handleGenerateRecommendations} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Recommendations
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Pattern Card Component
function PatternCard({
  label,
  value,
  status,
  icon,
}: {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'neutral';
  icon?: React.ReactNode;
}) {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-orange-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground uppercase">{label}</span>
      <span className={`text-2xl font-bold ${statusColors[status]} flex items-center gap-1`}>
        {value}
        {icon}
      </span>
    </div>
  );
}

// Recommendation Card Component
function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const icon = recommendationIcons[recommendation.type] || recommendationIcons.task;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg">{recommendation.title}</h3>
              <Badge variant={priorityColors[recommendation.priority]}>
                {recommendation.priority}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {recommendation.description}
            </p>

            <p className="text-xs text-muted-foreground italic mb-3">
              💡 {recommendation.reason}
            </p>

            {recommendation.action_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = recommendation.action_url!)}
              >
                Take Action <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
