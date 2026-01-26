import React from 'react';
import { useStore } from '../store/useStore';
import { getLevelProgress } from '../lib/level';
import { Trophy } from 'lucide-react';

export const LevelProgress: React.FC = () => {
  const { user } = useStore();
  const { level, currentLevelPoints, pointsNeededForNextLevel, progressPercent } = getLevelProgress(user.points);

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-yellow-50 rounded-lg border border-yellow-100 mr-2">
      <div className="relative">
        <Trophy className="w-5 h-5 text-yellow-600" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
          {level}
        </span>
      </div>
      
      <div className="flex flex-col w-24">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] font-semibold text-yellow-700 uppercase tracking-wider">LV.{level}</span>
          <span className="text-[9px] text-yellow-600 font-medium">
            {currentLevelPoints}/{pointsNeededForNextLevel} XP
          </span>
        </div>
        <div className="h-1.5 w-full bg-yellow-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
