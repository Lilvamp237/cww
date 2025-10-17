// src/app/(dashboard)/achievements/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, TrendingUp, Users } from 'lucide-react';

type BadgeType = {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
};

type UserBadge = {
  badge_id: number;
  earned_at: string;
  badges: BadgeType;
};

type WellnessPoints = {
  points: number;
  daily_streak: number;
  total_habits_completed: number;
  total_moods_logged: number;
  total_sleep_logged: number;
};

type TeamChallenge = {
  id: number;
  name: string;
  description: string;
  challenge_type: string;
  target_value: number;
  start_date: string;
  end_date: string;
  status: string;
  current_progress?: number;
};

export default function AchievementsPage() {
  const supabase = createClientComponentClient();
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<BadgeType[]>([]);
  const [wellnessPoints, setWellnessPoints] = useState<WellnessPoints>({
    points: 0,
    daily_streak: 0,
    total_habits_completed: 0,
    total_moods_logged: 0,
    total_sleep_logged: 0,
  });
  const [challenges, setChallenges] = useState<TeamChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
    fetchWellnessPoints();
    fetchChallenges();
  }, []);

  const fetchAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch earned badges
    const { data: earned } = await supabase
      .from('user_badges')
      .select(`
        badge_id,
        earned_at,
        badges (*)
      `)
      .eq('user_id', user.id);

    if (earned) {
      setEarnedBadges(earned as any);
    }

    // Fetch all available badges
    const { data: all } = await supabase
      .from('badges')
      .select('*')
      .order('category', { ascending: true });

    if (all) {
      setAvailableBadges(all);
    }

    setLoading(false);
  };

  const fetchWellnessPoints = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('wellness_points')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setWellnessPoints(data);
    }
  };

  const fetchChallenges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch challenges from user's circles
    const { data } = await supabase
      .from('challenge_participants')
      .select(`
        challenge_id,
        current_progress,
        team_challenges (
          id,
          name,
          description,
          challenge_type,
          target_value,
          start_date,
          end_date,
          status
        )
      `)
      .eq('user_id', user.id);

    if (data) {
      const formatted = data.map((item: any) => ({
        ...item.team_challenges,
        current_progress: item.current_progress,
      }));
      setChallenges(formatted);
    }
  };

  const earnedBadgeIds = earnedBadges.map(ub => ub.badge_id);
  const lockedBadges = availableBadges.filter(b => !earnedBadgeIds.includes(b.id));

  const getProgressForBadge = (badge: BadgeType): number => {
    switch (badge.requirement_type) {
      case 'daily_streak':
        return Math.min((wellnessPoints.daily_streak / badge.requirement_value) * 100, 100);
      case 'habits_completed':
        return Math.min((wellnessPoints.total_habits_completed / badge.requirement_value) * 100, 100);
      case 'mood_streak':
        return Math.min((wellnessPoints.daily_streak / badge.requirement_value) * 100, 100);
      default:
        return 0;
    }
  };

  const getLevel = (points: number): number => {
    return Math.floor(points / 100) + 1;
  };

  const getPointsToNextLevel = (points: number): number => {
    return 100 - (points % 100);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading achievements...</div>;
  }

  const currentLevel = getLevel(wellnessPoints.points);
  const pointsToNext = getPointsToNextLevel(wellnessPoints.points);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Achievements & Progress</h1>
        <p className="text-gray-600">Track your wellness journey with badges and challenges</p>
      </div>

      {/* Wellness Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wellness Level</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level {currentLevel}</div>
            <p className="text-xs text-muted-foreground">
              {pointsToNext} points to next level
            </p>
            <Progress
              value={(wellnessPoints.points % 100)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wellnessPoints.points}</div>
            <p className="text-xs text-muted-foreground">
              Keep logging to earn more!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wellnessPoints.daily_streak} days</div>
            <p className="text-xs text-muted-foreground">
              Don't break the chain!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {earnedBadges.length}/{availableBadges.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {lockedBadges.length} more to unlock
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="challenges">Team Challenges</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          {earnedBadges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Earned Badges ({earnedBadges.length})</CardTitle>
                <CardDescription>Your wellness achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {earnedBadges.map((ub) => (
                    <div
                      key={ub.badge_id}
                      className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100"
                    >
                      <div className="text-center space-y-2">
                        <div className="text-4xl">{ub.badges.icon}</div>
                        <h3 className="font-semibold">{ub.badges.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {ub.badges.description}
                        </p>
                        <Badge variant="secondary">{ub.badges.category}</Badge>
                        <p className="text-xs text-muted-foreground">
                          Earned {new Date(ub.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Locked Badges ({lockedBadges.length})</CardTitle>
              <CardDescription>Keep going to unlock these achievements!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {lockedBadges.map((badge) => {
                  const progress = getProgressForBadge(badge);
                  return (
                    <div
                      key={badge.id}
                      className="p-4 border rounded-lg bg-muted/50 opacity-75"
                    >
                      <div className="text-center space-y-2">
                        <div className="text-4xl grayscale">{badge.icon}</div>
                        <h3 className="font-semibold">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {badge.description}
                        </p>
                        <Badge variant="outline">{badge.category}</Badge>
                        <div className="space-y-1">
                          <Progress value={progress} />
                          <p className="text-xs text-muted-foreground">
                            {progress.toFixed(0)}% complete
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          {challenges.length > 0 ? (
            <div className="grid gap-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{challenge.name}</CardTitle>
                      <Badge
                        variant={challenge.status === 'active' ? 'default' : 'secondary'}
                      >
                        {challenge.status}
                      </Badge>
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {challenge.current_progress || 0} / {challenge.target_value}
                        </span>
                      </div>
                      <Progress
                        value={
                          ((challenge.current_progress || 0) / challenge.target_value) * 100
                        }
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Start: {new Date(challenge.start_date).toLocaleDateString()}</span>
                        <span>End: {new Date(challenge.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No Active Challenges</p>
                <p className="text-muted-foreground">
                  Join a Sync Circle to participate in team wellness challenges!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wellness Statistics</CardTitle>
              <CardDescription>Your overall wellness activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                  <div>
                    <p className="font-semibold">Total Moods Logged</p>
                    <p className="text-sm text-muted-foreground">Keep tracking daily</p>
                  </div>
                  <div className="text-3xl font-bold">{wellnessPoints.total_moods_logged}</div>
                </div>

                <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                  <div>
                    <p className="font-semibold">Total Habits Completed</p>
                    <p className="text-sm text-muted-foreground">Build healthy routines</p>
                  </div>
                  <div className="text-3xl font-bold">{wellnessPoints.total_habits_completed}</div>
                </div>

                <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                  <div>
                    <p className="font-semibold">Sleep Logs</p>
                    <p className="text-sm text-muted-foreground">Monitor your rest</p>
                  </div>
                  <div className="text-3xl font-bold">{wellnessPoints.total_sleep_logged}</div>
                </div>

                <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                  <div>
                    <p className="font-semibold">Current Streak</p>
                    <p className="text-sm text-muted-foreground">Consecutive days</p>
                  </div>
                  <div className="text-3xl font-bold">{wellnessPoints.daily_streak} 🔥</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Earn Points</CardTitle>
              <CardDescription>Activities that contribute to your wellness score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between p-2">
                  <span className="text-sm">Log your mood</span>
                  <Badge>+5 points</Badge>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-sm">Complete a habit</span>
                  <Badge>+3 points</Badge>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-sm">Log sleep</span>
                  <Badge>+5 points</Badge>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-sm">Maintain daily streak</span>
                  <Badge>Bonus multiplier</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
