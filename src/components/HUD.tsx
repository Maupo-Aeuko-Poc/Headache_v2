import React from 'react';
import { BiomeConfig } from '../types';

interface HUDProps {
  distance: number;
  maxGoal: number;
  biome: BiomeConfig;
  dashCooldown: number; // 0 (ready) to 0.85
  maxDashCooldown: number;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  distance,
  maxGoal,
  biome,
  dashCooldown,
  maxDashCooldown,
  onPause
}) => {
  const dashReady = dashCooldown <= 0;
  const dashProgress = Math.max(0, Math.min(1, 1 - dashCooldown / maxDashCooldown));

  return (
    <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-start justify-between pointer-events-none z-30">
      {/* Left: Distance & Biome */}
      <div className="space-y-1">
        <div className="font-cinzel text-xl sm:text-3xl font-bold text-[#ebdcb9] drop-shadow-[2px_2px_2px_#000]">
          {distance.toLocaleString()} / {maxGoal.toLocaleString()} m
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-elite text-xs sm:text-sm text-[#c7b38d] tracking-wider uppercase drop-shadow-[1px_1px_1px_#000]">
            {biome.name}
          </span>
          <span className="text-[10px] font-courier text-[#9e8b69] hidden sm:inline opacity-75">
            — {biome.description}
          </span>
        </div>
      </div>

      {/* Right: Dash Status & Pause Button */}
      <div className="flex items-center space-x-4">
        {/* Dash Ready Indicator */}
        <div className="flex items-center space-x-2 bg-[#18120c]/80 border border-[#544330] px-3 py-1.5 rounded-sm">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <svg className="w-5 h-5 -rotate-90">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="#38291a"
                strokeWidth="2.5"
                fill="transparent"
              />
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke={dashReady ? '#ebdcb9' : '#8a7250'}
                strokeWidth="2.5"
                strokeDasharray="50.26"
                strokeDashoffset={50.26 * (1 - dashProgress)}
                fill="transparent"
                className="transition-all duration-75"
              />
            </svg>
          </div>
          <span
            className={`font-courier text-xs tracking-wider ${
              dashReady ? 'text-[#ebdcb9] font-bold' : 'text-[#7d6c52]'
            }`}
          >
            {dashReady ? 'DASH READY' : 'RECOVERING'}
          </span>
        </div>

        {/* Pause Button */}
        <button
          onClick={onPause}
          className="pointer-events-auto eerie-button text-xs py-1.5 px-3 sm:px-4"
        >
          Breathe / Esc
        </button>
      </div>
    </div>
  );
};
