import React from 'react';
import { motion } from 'framer-motion';

const ScenarioSelector = ({ scenarios, currentScenario, onSelect, isDark }) => {
  return (
    <div className="flex gap-3 z-10">
      {scenarios.map((scenario) => {
        const isActive = scenario.id === currentScenario;
        
        return (
          <motion.button
            key={scenario.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onSelect(scenario.id); }}
            className={`px-6 py-2 rounded-full backdrop-blur-md text-sm font-medium tracking-wider transition-all ${
              isActive 
                ? 'text-white shadow-lg' 
                : isDark 
                  ? 'bg-white/10 text-white/70 hover:bg-white/20' 
                  : 'bg-black/10 text-black/70 hover:bg-black/20'
            }`}
            style={isActive ? {
              background: `linear-gradient(135deg, ${scenario.color} 0%, ${scenario.secondaryColor} 100%)`,
            } : {}}
          >
            {scenario.name}
          </motion.button>
        );
      })}
    </div>
  );
};

export default ScenarioSelector;
