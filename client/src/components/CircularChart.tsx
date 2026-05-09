import React from 'react';

interface CircularChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function CircularChart({ 
  percentage, 
  size = 140, 
  strokeWidth = 10,
  label 
}: CircularChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-plant-100 dark:text-plant-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-plant-500 dark:text-plant-400 transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-plant-600 dark:text-plant-300">
          {percentage}%
        </span>
        {label && (
          <span className="text-sm text-plant-500 dark:text-plant-400 mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}