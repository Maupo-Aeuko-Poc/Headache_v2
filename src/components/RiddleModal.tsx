import React from 'react';
import { Riddle } from '../types';

interface RiddleModalProps {
  riddle: Riddle;
  onAnswer: (chosenIndex: number) => void;
}

export const RiddleModal: React.FC<RiddleModalProps> = ({ riddle, onAnswer }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070605]/92 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl bg-[#282118] border-2 border-[#826e4e] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.95)] text-[#cbb892]">
        {/* Header */}
        <div className="text-center space-y-1 mb-6 border-b border-[#524432] pb-4">
          <span className="font-courier text-xs tracking-[0.25em] text-[#a38b64] uppercase block">
            THE KEEPER OF WHAT YOU LEFT BEHIND
          </span>
          <h2 className="font-cinzel text-xl sm:text-2xl text-[#ebdcb9] font-bold leading-snug">
            “{riddle.question}”
          </h2>
          <p className="font-elite text-xs text-[#8c7a60] italic pt-1">
            Clue: {riddle.clue}
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-elite">
          {riddle.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onAnswer(idx)}
              className="bg-[#18130d] hover:bg-[#382b1d] border border-[#6b583e] hover:border-[#ebdcb9] py-3 px-4 text-sm sm:text-base text-left text-[#d4c29d] hover:text-[#fff] transition-all transform hover:-translate-y-0.5 shadow-md"
            >
              <span className="text-[#8c7756] font-courier text-xs mr-2">
                [{idx + 1}]
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Eerie warning footnote */}
        <p className="mt-6 text-center text-xs font-courier text-[#6b5941] tracking-wider">
          CHOOSE CAREFULLY. THE ROOM IS LISTENING.
        </p>
      </div>
    </div>
  );
};
