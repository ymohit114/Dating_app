'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: 'rose' | 'emerald' | 'amber' | 'blue' | 'purple';
}

export function MetricCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  color = 'rose',
}: MetricCardProps) {
  const colorMap = {
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    blue: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="p-5 bg-zinc-900/90 border border-zinc-800/80 rounded-3xl shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</div>
        {change && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className={isPositive ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
              {change}
            </span>
            <span className="text-zinc-500">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
