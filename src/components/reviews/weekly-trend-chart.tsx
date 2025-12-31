"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { DailyLog, PromiseLog } from "@/lib/types";
import { getTotalUnits } from "@/lib/type-helpers";

interface WeeklyTrendChartProps {
  weeklyLogs: DailyLog[];
  promiseLogs: PromiseLog[];
}

export function WeeklyTrendChart({ weeklyLogs, promiseLogs }: WeeklyTrendChartProps) {
  // Create a map of logs by date
  const logsByDate = new Map<string, DailyLog>();
  weeklyLogs.forEach(log => {
    const dateKey = format(new Date(log.date), "yyyy-MM-dd");
    logsByDate.set(dateKey, log);
  });

  // Generate last 7 days
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - 6 + i);
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const chartData = days.map(date => {
    const dateKey = format(date, "yyyy-MM-dd");
    const log = logsByDate.get(dateKey);

    const dayPromiseCompletions = promiseLogs.filter(pl =>
      format(new Date(pl.date), "yyyy-MM-dd") === dateKey && pl.completed
    ).length;

    return {
      date: format(date, "EEE"),
      fullDate: format(date, "MMM d"),
      energy: log?.energy || 0,
      totalUnits: dayPromiseCompletions || getTotalUnits(log),
    };
  });

  return (
    <div className="w-full h-[250px] sm:h-[280px] md:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'monospace' }}
            dy={8}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'monospace' }}
            domain={[0, 5]}
            width={30}
            label={{ value: 'Energy', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)', style: { fontSize: '9px', fontFamily: 'monospace' } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'monospace' }}
            width={35}
            label={{ value: 'Units', angle: 90, position: 'insideRight', fill: 'rgba(255,255,255,0.4)', style: { fontSize: '9px', fontFamily: 'monospace' } }}
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
            formatter={(value: any, name?: string) => {
              if (name === 'energy') return [`${value}/5`, 'Energy'];
              if (name === 'totalUnits') return [value, 'Total Units'];
              return [value, name || ''];
            }}
            labelFormatter={(label) => `Day: ${label}`}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="energy"
            stroke="#8b5cf6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorEnergy)"
            name="energy"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalUnits"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            name="totalUnits"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

