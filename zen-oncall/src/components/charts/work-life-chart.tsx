'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line } from 'recharts';

// Define the shape of the data this chart expects
type WorkLifeData = {
  week: string;
  hours: number;
  energy: number | null; // Energy can be null if no logs for that week
};

interface WorkLifeChartProps {
  data: WorkLifeData[];
}

export function WorkLifeChart({ data }: WorkLifeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workload vs. Energy</CardTitle>
        <CardDescription>Your weekly hours worked against your average energy level.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" fontSize={12} label={{ value: 'Hours Worked', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[1, 5]} allowDecimals={false} fontSize={12} label={{ value: 'Avg. Energy', angle: 90, position: 'insideRight' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="hours" name="Hours Worked" fill="hsl(var(--primary))" />
                <Line yAxisId="right" type="monotone" dataKey="energy" name="Average Energy" stroke="#82ca9d" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Not enough data to display chart. Add shifts and log your energy.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}