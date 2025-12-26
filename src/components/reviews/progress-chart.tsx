"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

interface ProgressChartProps {
  data: Array<{
    label: string;
    actual: number;
    target: number;
    ratio: number;
  }>;
}

export function ProgressChart({ data }: ProgressChartProps) {
  const chartData = data.map(item => ({
    name: item.label,
    actual: item.actual,
    target: item.target,
    ratio: item.ratio * 100
  }));

  return (
    <div className="w-full h-[300px] mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barSize={40}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace' }}
            dy={10}
          />
          <YAxis 
            hide
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            contentStyle={{ 
              backgroundColor: 'rgba(15, 17, 21, 0.9)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}
            itemStyle={{ color: '#fff', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
            labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', marginBottom: '4px' }}
          />
          <Bar dataKey="actual" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.ratio >= 80 ? '#10b981' : entry.ratio >= 50 ? '#f59e0b' : '#ef4444'} 
                fillOpacity={0.8}
              />
            ))}
          </Bar>
          <Bar dataKey="target" fill="rgba(255,255,255,0.05)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

