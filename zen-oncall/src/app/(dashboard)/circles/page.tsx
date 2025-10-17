// src/app/(dashboard)/circles/page.tsx
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateCircleForm, JoinCircleForm } from './circle-forms';
import { createServerClient } from '@/lib/supabase/server'; // ✅ corrected import

export default async function CirclesPage() {
  const supabase = await createServerClient();

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view circles.</div>;
  }

  // Fetch circles where the user is a member - FIXED QUERY
  const { data: membershipData, error: membershipError } = await supabase
    .from('circle_members')
    .select('circle_id')
    .eq('user_id', user.id);

  console.log('User ID:', user.id);
  console.log('Membership data:', membershipData);
  console.log('Membership error:', membershipError);

  if (membershipError) {
    console.error('Error fetching memberships:', membershipError);
  }

  // Get the circle IDs
  const circleIds = membershipData?.map(m => m.circle_id) || [];
  console.log('Circle IDs:', circleIds);

  // Fetch the actual circle details
  let userCircles: any[] = [];
  if (circleIds.length > 0) {
    const { data: circlesData, error: circlesError } = await supabase
      .from('circles')
      .select('id, name, invite_code')
      .in('id', circleIds);

    console.log('Circles data:', circlesData);
    console.log('Circles error:', circlesError);

    if (circlesError) {
      console.error('Error fetching circles:', circlesError);
    } else {
      userCircles = circlesData || [];
    }
  }
  
  console.log('Final userCircles:', userCircles);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Animated Header with Icon */}
      <div className="text-center space-y-2 animate-in slide-in-from-top duration-500">
        <div className="inline-block p-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-2 animate-bounce">
          <span className="text-4xl">👥</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Sync Circles
        </h1>
        <p className="text-lg text-slate-600">Collaborate with your team, share schedules, and coordinate breaks.</p>
      </div>

      {/* Create/Join Cards with Gradients */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-t-4 border-t-emerald-500 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-left duration-700">
          <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                <span className="text-2xl">➕</span>
              </div>
              <div>
                <CardTitle className="text-xl text-emerald-700">Create a New Circle</CardTitle>
                <CardDescription className="text-emerald-600">Start a new group for your unit or department.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <CreateCircleForm />
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-cyan-500 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-right duration-700">
          <CardHeader className="bg-gradient-to-br from-cyan-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md">
                <span className="text-2xl">🔗</span>
              </div>
              <div>
                <CardTitle className="text-xl text-cyan-700">Join an Existing Circle</CardTitle>
                <CardDescription className="text-cyan-600">Enter an invite code to join a team.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <JoinCircleForm />
          </CardContent>
        </Card>
      </div>

      {/* Circles List with Modern Design */}
      <div className="animate-in slide-in-from-bottom duration-700 delay-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <span className="text-2xl">🎯</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Your Circles ({userCircles.length})
          </h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userCircles && userCircles.length > 0 ? (
            userCircles.map((circle, index) => (
              <Link
                key={circle.id}
                href={`/circles/${Number(circle.id)}`}
                className="group animate-in fade-in-50 slide-in-from-bottom duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full border-l-4 border-l-violet-500 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-white to-violet-50 group-hover:from-violet-50 group-hover:to-purple-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl group-hover:text-violet-600 transition-colors duration-300">
                          {circle.name}
                        </CardTitle>
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                          <span>🔑</span>
                          <code className="font-mono">{circle.invite_code}</code>
                        </div>
                      </div>
                      <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                        👥
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-16 space-y-4">
              <div className="text-7xl opacity-30 animate-pulse">🔍</div>
              <p className="text-xl text-slate-500">You are not a member of any circles yet.</p>
              <p className="text-sm text-slate-400">Create a new circle or join an existing one above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
