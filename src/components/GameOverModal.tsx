import React from 'react';

interface GameOverModalProps {
  reason: string;
  distance: number;
  best: number;
  seed: number;
  onRetry: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  reason,
  distance,
  best,
  seed,
  onRetry,
  onMenu
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070504]/94 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-[#241c14] border-2 border-[#82382c] p-6 sm:p-8 text-center shadow-[0_0_70px_rgba(130,56,44,0.3)]">
        {/* Title */}
        <h2 className="font-cinzel text-4xl sm:text-5xl text-[#d95b4a] font-black tracking-wider mb-2">
          YOU NEVER LEFT.
        </h2>

        {/* Reason */}
        <p className="font-elite text-sm sm:text-base text-[#c4b08b] italic mb-6">
          “{reason}”
        </p>

        {/* Stats */}
        <div className="bg-[#140f0b] border border-[#4d2820] py-3 px-4 mb-6 space-y-1 font-courier text-xs text-[#a69274]">
          <div className="flex justify-between">
            <span>Distance Reached:</span>
            <span className="text-[#ebdcb9] font-bold">{distance.toLocaleString()} m</span>
          </div>
          <div className="flex justify-between">
            <span>Furthest Record:</span>
            <span className="text-[#ebdcb9] font-bold">{best.toLocaleString()} m</span>
          </div>
          <div className="flex justify-between text-[10px] text-[#6b5840]">
            <span>Mind Seed:</span>
            <span>{seed}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="eerie-button text-sm py-2 px-6 bg-[#3d1a14] border-[#a64030] text-[#ffded8] hover:border-[#ff9a8a]"
          >
            Run Again
          </button>
          <button
            onClick={onMenu}
            className="eerie-button text-sm py-2 px-6"
          >
            Return to Glass
          </button>
        </div>
      </div>
    </div>
  );
};
