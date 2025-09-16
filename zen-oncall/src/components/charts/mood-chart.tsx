'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

// Define the shape of the data this chart expects
type MoodData = {
  date: string;
  mood: number;
};

interface MoodChartProps {
  data: MoodData[];
}

export function MoodChart({ data }: MoodChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Over Time</CardTitle>
        <CardDescription>Your daily mood score for the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 1 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[1, 5]} allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Not enough data to display chart. Keep logging your mood daily!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}