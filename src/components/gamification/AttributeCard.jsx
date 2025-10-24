import React from 'react';
import { motion } from 'framer-motion';

export default function AttributeCard({ icon: Icon, name, level, xp, xpToNextLevel, color }) {
  const progress = (xp / xpToNextLevel) * 100;

  return (
    <motion.div 
      className="bg-white/5 border border-white/10 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200"
      whileHover={{ scale: 1.03 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <h4 className="font-semibold text-base text-gray-200">{name}</h4>
        </div>
        <div className="text-sm font-bold text-gray-300 bg-black/30 px-2 py-0.5 rounded">Lvl {level}</div>
      </div>
      <div className="relative h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
        <motion.div 
            className={`absolute top-0 left-0 h-full rounded-full ${color.replace('text', 'bg').replace('-400', '-500')}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%`}}
            transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1.5 text-right font-mono">
        {xp} / {xpToNextLevel} XP
      </div>
    </motion.div>
  );
}