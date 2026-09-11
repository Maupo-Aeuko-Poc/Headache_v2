import React from 'react';

interface PauseModalProps {
  onResume: () => void;
  onSettings: () => void;
  onQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onSettings,
  onQuit
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070605]/92 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm bg-[#282118] border-2 border-[#826e4e] p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(0,0,0,0.95)] text-[#cbb892]">
        <h2 className="font-cinzel text-3xl sm:text-4xl text-[#ebdcb9] font-bold tracking-wider mb-2">
          HOLD YOUR BREATH.
        </h2>

        <div className="text-xs font-elite text-[#8c7857] space-y-1 mb-6 border-y border-[#4a3b2b] py-3">
          <p>A / D or ← / → — Move</p>
          <p>Space / W / ↑ — Jump (Twice in air)</p>
          <p>Shift / X — Dash into shadows</p>
          <p>Esc — Pause</p>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={onResume}
            className="eerie-button text-sm py-2"
          >
            Keep Running
          </button>
          <button
            onClick={onSettings}
            className="eerie-button text-sm py-2"
          >
            Breathe (Settings)
          </button>
          <button
            onClick={onQuit}
            className="eerie-button text-sm py-2 text-[#9c785d] hover:text-[#c49274]"
          >
            Return to the Glass
          </button>
        </div>
      </div>
    </div>
  );
};
