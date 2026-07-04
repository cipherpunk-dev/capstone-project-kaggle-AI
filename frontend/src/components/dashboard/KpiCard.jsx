import React from 'react';
import { cn } from '../../utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function KpiCard({ title, value, trend, icon: Icon, trendLabel }) {
  const isPositive = trend >= 0;

  return (
    <div className="bg-background-secondary rounded-xl p-6 border border-border-secondary shadow-sm flex flex-col hover:border-border-primary transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        <div className="p-2 bg-background-tertiary rounded-lg">
          <Icon className="w-5 h-5 text-text-primary" />
        </div>
      </div>
      
      <div className="mt-auto">
        <p className="text-3xl font-bold text-text-primary mb-2">{value}</p>
        
        {trend !== undefined && (
          <div className="flex items-center text-xs">
            <span 
              className={cn(
                "flex items-center font-medium px-1.5 py-0.5 rounded-md",
                isPositive 
                  ? "bg-status-success/10 text-status-success" 
                  : "bg-status-error/10 text-status-error"
              )}
            >
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}%
            </span>
            {trendLabel && <span className="ml-2 text-text-tertiary">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
