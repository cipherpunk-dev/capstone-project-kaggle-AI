import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../utils/cn';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background-elevated border border-border-primary rounded-lg shadow-lg p-3 text-sm">
        <p className="text-text-secondary mb-1 font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-text-primary font-bold">{entry.value}</span>
            <span className="text-text-tertiary capitalize">{entry.name}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PerformanceChart({ data, title }) {
  return (
    <div className="bg-background-secondary rounded-xl p-6 border border-border-secondary shadow-sm flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-text-primary text-lg">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
           <div className="flex items-center gap-2">
             <span className="w-3 h-3 rounded-full bg-accent-primary"></span>
             <span className="text-text-secondary">Avg Score</span>
           </div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="var(--text-tertiary)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="var(--text-tertiary)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-10}
              domain={[0, 10]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="score" 
              name="Avg Score"
              stroke="var(--accent-primary)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorScore)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
