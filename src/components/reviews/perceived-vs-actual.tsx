"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

interface PerceivedVsActualProps {
  data: Array<{
    name: string;
    perceived: number;
    actual: number;
  }>;
}

export function PerceivedVsActual({ data }: PerceivedVsActualProps) {
  return (
    <div className="w-full h-[350px] mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
            domain={[0, 10]}
            hide
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 17, 21, 0.9)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}
            itemStyle={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
            labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', marginBottom: '4px' }}
          />
          <Legend 
            verticalAlign="top" 
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
          />
          <Line 
            type="monotone" 
            dataKey="perceived" 
            stroke="#8B5CF6" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#8B5CF6' }}
            activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
            name="Self-Perception"
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#10B981" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#10B981' }}
            activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
            name="Actual Progress"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

