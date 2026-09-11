import React from 'react';

interface TouchControlsProps {
  onPressKey: (key: string) => void;
  onReleaseKey: (key: string) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onPressKey,
  onReleaseKey
}) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none z-30 sm:hidden">
      {/* Directional buttons (Left / Right) */}
      <div className="flex space-x-2 pointer-events-auto">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onPressKey('ArrowLeft');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onReleaseKey('ArrowLeft');
          }}
          onTouchCancel={() => onReleaseKey('ArrowLeft')}
          onMouseDown={() => onPressKey('ArrowLeft')}
          onMouseUp={() => onReleaseKey('ArrowLeft')}
          onMouseLeave={() => onReleaseKey('ArrowLeft')}
          className="w-14 h-14 bg-[#1e1710]/90 border border-[#6b583e] active:bg-[#382b1d] text-[#ebdcb9] font-cinzel text-xl flex items-center justify-center rounded-sm select-none"
        >
          ←
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onPressKey('ArrowRight');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onReleaseKey('ArrowRight');
          }}
          onTouchCancel={() => onReleaseKey('ArrowRight')}
          onMouseDown={() => onPressKey('ArrowRight')}
          onMouseUp={() => onReleaseKey('ArrowRight')}
          onMouseLeave={() => onReleaseKey('ArrowRight')}
          className="w-14 h-14 bg-[#1e1710]/90 border border-[#6b583e] active:bg-[#382b1d] text-[#ebdcb9] font-cinzel text-xl flex items-center justify-center rounded-sm select-none"
        >
          →
        </button>
      </div>

      {/* Action buttons (Jump & Dash) */}
      <div className="flex space-x-2 pointer-events-auto">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onPressKey('ShiftLeft');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onReleaseKey('ShiftLeft');
          }}
          onTouchCancel={() => onReleaseKey('ShiftLeft')}
          onMouseDown={() => onPressKey('ShiftLeft')}
          onMouseUp={() => onReleaseKey('ShiftLeft')}
          onMouseLeave={() => onReleaseKey('ShiftLeft')}
          className="w-14 h-14 bg-[#1e1710]/90 border border-[#6b583e] active:bg-[#382b1d] text-[#ebdcb9] font-courier text-xs flex items-center justify-center rounded-sm select-none font-bold"
        >
          DASH
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onPressKey('Space');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onReleaseKey('Space');
          }}
          onTouchCancel={() => onReleaseKey('Space')}
          onMouseDown={() => onPressKey('Space')}
          onMouseUp={() => onReleaseKey('Space')}
          onMouseLeave={() => onReleaseKey('Space')}
          className="w-16 h-16 bg-[#2b2016]/90 border-2 border-[#a38b64] active:bg-[#4a3827] text-[#ebdcb9] font-cinzel text-sm flex items-center justify-center rounded-sm select-none font-bold shadow-lg"
        >
          JUMP
        </button>
      </div>
    </div>
  );
};
