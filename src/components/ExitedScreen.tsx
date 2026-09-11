import React from 'react';

interface ExitedScreenProps {
  onStay: () => void;
}

export const ExitedScreen: React.FC<ExitedScreenProps> = ({ onStay }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050403] p-4 text-center">
      <div className="max-w-md space-y-6">
        <h2 className="font-cinzel text-4xl sm:text-5xl text-[#827154] font-black tracking-widest">
          THE GLASS IS STILL HERE.
        </h2>
        <p className="font-elite text-sm sm:text-base text-[#615440] italic">
          You can close this browser tab now.
        </p>
        <div className="pt-4">
          <button
            onClick={onStay}
            className="eerie-button text-xs py-2 px-6 border-[#524432] text-[#8c7857]"
          >
            Stay a little longer
          </button>
        </div>
      </div>
    </div>
  );
};
