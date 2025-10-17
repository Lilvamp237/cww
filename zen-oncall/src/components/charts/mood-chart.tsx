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
    <Card className="border-t-4 border-t-violet-500 shadow-lg">
      <CardHeader className="bg-gradient-to-br from-violet-50 to-purple-50">
        <CardTitle className="text-2xl text-violet-700 flex items-center gap-2">
          <span>📊</span> Mood Over Time
        </CardTitle>
        <CardDescription className="text-violet-600">Your daily mood score for the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {data.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  stroke="#64748b"
                />
                <YAxis 
                  domain={[0, 5]} 
                  ticks={[0, 1, 2, 3, 4, 5]}
                  allowDecimals={false} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  stroke="#64748b"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #8b5cf6',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                  labelStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }} 
                  name="Mood Score"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-6xl opacity-30">😊</div>
            <p className="text-slate-500 text-lg">Not enough data to display chart.</p>
            <p className="text-slate-400 text-sm">Keep logging your mood daily to see trends!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}