import React from 'react';
import { Difficulty, GameSettings } from '../types';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
  onToggleFullscreen: () => void;
  onWarpDistance?: (meters: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onToggleFullscreen,
  onWarpDistance
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070605]/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#2b241c] border-2 border-[#826e4e] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.95)] text-[#cbb892]">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-[#524432] pb-3 mb-6">
          <h2 className="font-cinzel text-3xl sm:text-4xl text-[#ebdcb9] tracking-wider">
            BREATHE
          </h2>
          <span className="font-courier text-xs text-[#8c7858] tracking-widest uppercase">
            [ SETTINGS ]
          </span>
        </div>

        <div className="space-y-6 font-elite">
          {/* Resolution */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label htmlFor="setting-res" className="text-sm tracking-wide text-[#d4c29d]">
              Resolution Scale:
            </label>
            <select
              id="setting-res"
              value={settings.resolution}
              onChange={(e) => onUpdateSettings({ resolution: parseFloat(e.target.value) })}
              className="bg-[#18130d] text-[#ebdcb9] border border-[#6b583e] px-3 py-1.5 text-sm font-courier outline-none focus:border-[#ebdcb9]"
            >
              <option value="0.75">720 × 405 (Performance)</option>
              <option value="1">960 × 540 (Native 1x)</option>
              <option value="1.5">1440 × 810 (High 1.5x)</option>
              <option value="2">1920 × 1080 (Crisp 2x)</option>
            </select>
          </div>

          {/* Difficulty Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label htmlFor="setting-diff" className="text-sm tracking-wide text-[#d4c29d]">
              State of Mind (Difficulty):
            </label>
            <select
              id="setting-diff"
              value={settings.difficulty}
              onChange={(e) => onUpdateSettings({ difficulty: e.target.value as Difficulty })}
              className="bg-[#18130d] text-[#ebdcb9] border border-[#6b583e] px-3 py-1.5 text-sm font-courier outline-none focus:border-[#ebdcb9]"
            >
              <option value="dream">Dream (Easy - Slower, generous grace)</option>
              <option value="nightmare">Nightmare (Normal - True horror)</option>
              <option value="schizophrenia">Schizophrenia (Hard - Relentless)</option>
            </select>
          </div>

          {/* Quiet the Room (Mute) */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-sm tracking-wide text-[#d4c29d] block">
                Quiet the room:
              </span>
              <span className="text-xs text-[#7a6b54]">
                Mute all synthesized dark drones and sounds
              </span>
            </div>
            <input
              id="setting-mute"
              type="checkbox"
              checked={settings.mute}
              onChange={(e) => onUpdateSettings({ mute: e.target.checked })}
              className="w-5 h-5 accent-[#a38b64] cursor-pointer"
            />
          </div>

          {/* Reduce Motion & Flashes */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-sm tracking-wide text-[#d4c29d] block">
                Calm the vision:
              </span>
              <span className="text-xs text-[#7a6b54]">
                Reduce intense camera shakes and flashing imagery
              </span>
            </div>
            <input
              id="setting-reduced"
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => onUpdateSettings({ reducedMotion: e.target.checked })}
              className="w-5 h-5 accent-[#a38b64] cursor-pointer"
            />
          </div>

          {/* Fullscreen Button */}
          <div className="pt-2">
            <button
              onClick={onToggleFullscreen}
              className="w-full text-center border border-[#766348] hover:border-[#ebdcb9] bg-[#1a140e] py-2 text-sm text-[#d4c29d] hover:text-[#fff] transition-colors"
            >
              Toggle Fullscreen Display
            </button>
          </div>

          {/* Milestone Practice / Biome Warp (Super handy for players & testing) */}
          {onWarpDistance && (
            <div className="pt-3 border-t border-[#4a3c2b]">
              <span className="text-xs font-courier text-[#8a7657] uppercase tracking-wider block mb-2">
                Fast-Travel Mirror (Practice / Check Biomes):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-courier">
                <button
                  onClick={() => onWarpDistance(0)}
                  className="bg-[#18130d] hover:bg-[#2e2316] border border-[#50402e] py-1 px-2 text-left"
                >
                  0m: Weeping Woods
                </button>
                <button
                  onClick={() => onWarpDistance(500)}
                  className="bg-[#18130d] hover:bg-[#2e2316] border border-[#50402e] py-1 px-2 text-left"
                >
                  500m: House With No Outside
                </button>
                <button
                  onClick={() => onWarpDistance(1000)}
                  className="bg-[#18130d] hover:bg-[#2e2316] border border-[#50402e] py-1 px-2 text-left"
                >
                  1000m: Drowned Orchard
                </button>
                <button
                  onClick={() => onWarpDistance(1500)}
                  className="bg-[#18130d] hover:bg-[#2e2316] border border-[#50402e] py-1 px-2 text-left"
                >
                  1500m: Cathedral of Teeth
                </button>
                <button
                  onClick={() => onWarpDistance(2000)}
                  className="bg-[#18130d] hover:bg-[#2e2316] border border-[#50402e] py-1 px-2 text-left"
                >
                  2000m: Where Snow is Ash
                </button>
                <button
                  onClick={() => onWarpDistance(49950)}
                  className="bg-[#381a14] hover:bg-[#52241b] border border-[#803124] py-1 px-2 text-left text-[#ebdcb9] font-bold"
                >
                  49,950m: The End (Finale Cutscene)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="eerie-button text-sm py-2 px-6"
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );
};
