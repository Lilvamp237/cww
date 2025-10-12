'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DiagnosticPage() {
  const supabase = createClientComponentClient();
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {
        user: null,
        profile: null,
        circles: [],
        circleMembers: [],
        shifts: [],
        tables: {},
        errors: [],
      };

      try {
        // Check user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) results.errors.push(`User error: ${userError.message}`);
        results.user = user ? { id: user.id, email: user.email } : null;

        if (user) {
          // Check profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (profileError) results.errors.push(`Profile error: ${profileError.message}`);
          results.profile = profile;

          // Check circles
          const { data: circles, error: circlesError } = await supabase
            .from('circles')
            .select('*');
          if (circlesError) results.errors.push(`Circles error: ${circlesError.message}`);
          results.circles = circles || [];

          // Check circle members
          const { data: members, error: membersError } = await supabase
            .from('circle_members')
            .select('*')
            .eq('user_id', user.id);
          if (membersError) results.errors.push(`Members error: ${membersError.message}`);
          results.circleMembers = members || [];

          // Check shifts
          const { data: shifts, error: shiftsError } = await supabase
            .from('shifts')
            .select('*')
            .eq('user_id', user.id);
          if (shiftsError) results.errors.push(`Shifts error: ${shiftsError.message}`);
          results.shifts = shifts || [];

          // Check if tables exist
          const tables = ['personal_tasks', 'habits', 'habit_logs', 'circle_announcements', 'shift_swaps'];
          for (const table of tables) {
            try {
              const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
              results.tables[table] = error ? `Error: ${error.message}` : `Exists (${count} rows)`;
            } catch (e: any) {
              results.tables[table] = `Error: ${e.message}`;
            }
          }
        }
      } catch (e: any) {
        results.errors.push(`General error: ${e.message}`);
      }

      setDiagnostics(results);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Running Diagnostics...</h1>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">System Diagnostics</h1>

      {/* Errors */}
      {diagnostics.errors.length > 0 && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">⚠️ Errors Found</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {diagnostics.errors.map((error: string, i: number) => (
                <li key={i} className="text-red-600 font-mono text-sm">{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>👤 User Information</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnostics.user ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{diagnostics.user.id}</code></p>
              <p><strong>Email:</strong> {diagnostics.user.email}</p>
            </div>
          ) : (
            <p className="text-red-600">❌ Not authenticated</p>
          )}
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnostics.profile ? (
            <div className="space-y-2">
              <p><strong>Name:</strong> {diagnostics.profile.full_name || 'Not set'}</p>
              <p><strong>Created:</strong> {new Date(diagnostics.profile.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-red-600">❌ Profile not found - THIS IS THE PROBLEM!</p>
          )}
        </CardContent>
      </Card>

      {/* Circles */}
      <Card>
        <CardHeader>
          <CardTitle>🔵 Your Circles</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnostics.circleMembers.length > 0 ? (
            <div className="space-y-4">
              {diagnostics.circleMembers.map((member: any) => {
                const circle = diagnostics.circles.find((c: any) => c.id === member.circle_id);
                return (
                  <div key={member.circle_id} className="p-3 bg-gray-50 rounded">
                    <p><strong>Circle:</strong> {circle?.name || 'Unknown'}</p>
                    <p><strong>Share Shifts:</strong> {member.share_shifts ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Share Status:</strong> {member.share_status ? '✅ Yes' : '❌ No'}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-yellow-600">⚠️ Not a member of any circles</p>
          )}
        </CardContent>
      </Card>

      {/* Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Your Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnostics.shifts.length > 0 ? (
            <div className="space-y-2">
              <p className="font-semibold">{diagnostics.shifts.length} shift(s) found</p>
              {diagnostics.shifts.map((shift: any) => (
                <div key={shift.id} className="p-2 bg-gray-50 rounded text-sm">
                  <p><strong>{shift.title}</strong></p>
                  <p>{new Date(shift.start_time).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-yellow-600">⚠️ No shifts found</p>
          )}
        </CardContent>
      </Card>

      {/* Tables Status */}
      <Card>
        <CardHeader>
          <CardTitle>🗄️ Database Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(diagnostics.tables).map(([table, status]) => (
              <div key={table} className="flex justify-between p-2 bg-gray-50 rounded">
                <code className="font-mono">{table}</code>
                <span className={typeof status === 'string' && status.includes('Error') ? 'text-red-600' : 'text-green-600'}>
                  {String(status)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="border-blue-500">
        <CardHeader>
          <CardTitle>🔧 What To Do</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            {!diagnostics.profile && (
              <li className="text-red-600 font-semibold">
                Run <code className="bg-gray-100 px-2 py-1 rounded">quick-fix.sql</code> in Supabase SQL Editor to create your profile
              </li>
            )}
            {diagnostics.circleMembers.length === 0 && (
              <li className="text-yellow-600">
                Join or create a circle to test team features
              </li>
            )}
            {diagnostics.shifts.length === 0 && (
              <li className="text-yellow-600">
                Add some shifts in the scheduler to see them in team view
              </li>
            )}
            {Object.values(diagnostics.tables).some((v: any) => v.includes('Error')) && (
              <li className="text-red-600">
                Run <code className="bg-gray-100 px-2 py-1 rounded">database-schema-updates.sql</code> to create missing tables
              </li>
            )}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
