import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const StatsChart = ({ data, color, secondaryColor, view, onViewChange, isDark }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`px-3 py-2 rounded-lg backdrop-blur-md text-sm ${
          isDark ? 'bg-white/20 text-white' : 'bg-black/20 text-black'
        }`}>
          {payload[0].value} 分钟
        </div>
      );
    }
    return null;
  };

  const gradientId = `chartGradient-${color.replace('#', '')}`;

  return (
    <div className={`p-4 rounded-2xl backdrop-blur-md ${
      isDark ? 'bg-white/10' : 'bg-black/10'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-sm font-medium ${
          isDark ? 'text-white/80' : 'text-black/80'
        }`}>
          专注时长
        </h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onViewChange('week'); }}
            className={`px-4 py-1 rounded-full text-xs font-medium ${
              view === 'week'
                ? isDark ? 'bg-white/20 text-white' : 'bg-black/20 text-black'
                : isDark ? 'text-white/50' : 'text-black/50'
            }`}
          >
            周
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onViewChange('month'); }}
            className={`px-4 py-1 rounded-full text-xs font-medium ${
              view === 'month'
                ? isDark ? 'bg-white/20 text-white' : 'bg-black/20 text-black'
                : isDark ? 'text-white/50' : 'text-black/50'
            }`}
          >
            月
          </motion.button>
        </div>
      </div>
      
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height={128}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', 
                fontSize: 10 
              }}
              interval={view === 'month' ? 4 : 0}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area 
              type="monotone" 
              dataKey="minutes" 
              stroke="none" 
              fill={`url(#${gradientId})`}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Line 
              type="monotone" 
              dataKey="minutes" 
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4, strokeWidth: 0 }}
              activeDot={{ 
                fill: color, 
                r: 6, 
                strokeWidth: 2, 
                stroke: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
              }}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsChart;
