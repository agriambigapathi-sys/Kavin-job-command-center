import React from 'react';
import { ArrowUp, ArrowDown, FileText, LucideIcon } from 'lucide-react';

export interface PerformanceGaugeProps {
  title: string;
  currentValue: number;
  unit?: string;
  min?: number;
  max: number;
  idealText: string;
  overallValue: number | string;
  thisWeekValue: number | string;
  weeklyDelta: number | string;
  isPositiveDelta?: boolean;
  color: 'blue' | 'orange' | 'cyan' | 'green' | 'purple';
  icon?: LucideIcon;
}

export const PerformanceGauge: React.FC<PerformanceGaugeProps> = ({
  title,
  currentValue,
  unit = '',
  min = 0,
  max,
  idealText,
  overallValue,
  thisWeekValue,
  weeklyDelta,
  isPositiveDelta = true,
  color,
  icon: Icon = FileText,
}) => {
  // Calculate percentage for the semi-circle (0 to 180 degrees)
  const clamped = Math.max(min, Math.min(max, currentValue));
  const percentage = max > min ? (clamped - min) / (max - min) : 0;
  
  // Semi-circle SVG parameters
  // Center (100, 90), Radius 70
  // Arc starts at (30, 90) and ends at (170, 90)
  // Total arc length = PI * 70 ≈ 219.91
  const radius = 70;
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength * (1 - percentage);

  // Color configurations
  const colorMap = {
    blue: {
      stroke: '#3B82F6',
      glow: 'rgba(59, 130, 246, 0.4)',
      gradientStart: '#60A5FA',
      gradientEnd: '#2563EB',
    },
    orange: {
      stroke: '#F97316',
      glow: 'rgba(249, 115, 22, 0.4)',
      gradientStart: '#FB923C',
      gradientEnd: '#EA580C',
    },
    cyan: {
      stroke: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.4)',
      gradientStart: '#22D3EE',
      gradientEnd: '#0891B2',
    },
    green: {
      stroke: '#10B981',
      glow: 'rgba(16, 185, 129, 0.4)',
      gradientStart: '#34D399',
      gradientEnd: '#059669',
    },
    purple: {
      stroke: '#A855F7',
      glow: 'rgba(168, 85, 247, 0.4)',
      gradientStart: '#C084FC',
      gradientEnd: '#9333EA',
    },
  };

  const currentTheme = colorMap[color] || colorMap.blue;
  const gradientId = `gauge-grad-${color}-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="relative flex flex-col justify-between p-5 rounded-2xl bg-[#091122] dark:bg-[#0B132B] border border-slate-800/90 shadow-lg text-white">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-6 h-6 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h4 className="text-sm font-bold text-slate-100 tracking-tight">
          {title}
        </h4>
      </div>

      {/* Speedometer Gauge Visual */}
      <div className="relative flex flex-col items-center justify-center my-1">
        <svg viewBox="0 0 200 115" className="w-48 h-28 overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={currentTheme.gradientStart} />
              <stop offset="100%" stopColor={currentTheme.gradientEnd} />
            </linearGradient>
            <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={currentTheme.stroke} floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 30,95 A 70,70 0 0,1 170,95"
            fill="none"
            stroke="#1E293B"
            strokeWidth="11"
            strokeLinecap="round"
          />

          {/* Glowing Active Arc */}
          <path
            d="M 30,95 A 70,70 0 0,1 170,95"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="11"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={`url(#glow-${gradientId})`}
            className="transition-all duration-700 ease-out"
          />

          {/* Min and Max Range Indicators */}
          <text x="30" y="112" fill="#64748B" fontSize="10" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">
            {min}
          </text>
          <text x="170" y="112" fill="#64748B" fontSize="10" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">
            {max}
          </text>
        </svg>

        {/* Center Display Value inside Arc */}
        <div className="absolute top-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-3xl font-black tracking-tight text-white">
            {currentValue}
            {unit}
          </div>
        </div>

        {/* Ideal Target Pill */}
        <div className="mt-1 px-4 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] font-bold text-slate-300 shadow-inner">
          {idealText}
        </div>
      </div>

      {/* Breakdown Rows */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span>Overall</span>
          <span className="font-bold text-slate-100 font-mono">{overallValue}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>This Week</span>
          <span className="font-bold text-slate-100 font-mono">{thisWeekValue}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400 pt-0.5">
          <span>Weekly Delta</span>
          <div className="flex items-center gap-1 font-bold text-emerald-400 font-mono">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px]">
              {isPositiveDelta ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            </span>
            <span>{weeklyDelta}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
