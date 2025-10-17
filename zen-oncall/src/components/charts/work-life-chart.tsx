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
    <Card className="border-t-4 border-t-cyan-500 shadow-lg">
      <CardHeader className="bg-gradient-to-br from-cyan-50 to-blue-50">
        <CardTitle className="text-2xl text-cyan-700 flex items-center gap-2">
          <span>⚡</span> Workload vs. Energy
        </CardTitle>
        <CardDescription className="text-cyan-600">Your weekly hours worked against your average energy level.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {data.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="week" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  stroke="#64748b"
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#0891b2" 
                  fontSize={12} 
                  label={{ value: 'Hours Worked', angle: -90, position: 'insideLeft', style: { fill: '#0891b2' } }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#10b981" 
                  domain={[0, 5]} 
                  ticks={[0, 1, 2, 3, 4, 5]}
                  allowDecimals={false} 
                  fontSize={12} 
                  label={{ value: 'Avg. Energy', angle: 90, position: 'insideRight', style: { fill: '#10b981' } }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #0891b2',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                  labelStyle={{ color: '#0891b2', fontWeight: 'bold' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="hours" 
                  name="Hours Worked" 
                  fill="#0891b2" 
                  radius={[8, 8, 0, 0]}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="energy" 
                  name="Average Energy" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                  connectNulls={true}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-6xl opacity-30">📊</div>
            <p className="text-slate-500 text-lg">Not enough data to display chart.</p>
            <p className="text-slate-400 text-sm">Add shifts and log your energy to see trends!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}