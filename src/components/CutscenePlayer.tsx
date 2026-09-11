import React, { useEffect, useState, useRef } from 'react';
import { IMAGE_URLS } from '../game/imageAssets';
import { sounds } from '../audio/soundEngine';

interface CutscenePlayerProps {
  type: 'intro' | 'ending';
  onComplete: () => void;
  reducedMotion: boolean;
  resolution: number;
}

interface ComicSlide {
  image: string;
  act: string;
  caption: string;
  dialogue?: string;
  cueSound?: () => void;
}

const INTRO_SLIDES: ComicSlide[] = [
  {
    image: IMAGE_URLS.cutscenePanel1,
    act: 'PANEL I • THE LOOKING GLASS',
    caption: 'A throbbing ache splits the skull. Over your shoulder, the antique mirror stares back with cold, motionless dread.',
    dialogue: '“...Who is that standing behind my reflection?”',
    cueSound: () => sounds.playHeartbeat()
  },
  {
    image: IMAGE_URLS.cutscenePanel2,
    act: 'PANEL II • THE SHATTERING BLOW',
    caption: 'The reflection sneers. A heavy gloved fist punches straight through the silvered glass, exploding into a shower of razor shards.',
    dialogue: '“Too slow, old friend.”',
    cueSound: () => {
      sounds.playGlassShatter();
      sounds.playPunch();
    }
  },
  {
    image: IMAGE_URLS.cutscenePanel3,
    act: 'PANEL III • THE EMERGENCE',
    caption: 'A tall silhouette in a Victorian top hat steps coolly out of the shattered mirror frame onto the splintered bedroom floor.',
    dialogue: '“This is the hell you created.”',
    cueSound: () => sounds.playCigarPuff()
  },
  {
    image: IMAGE_URLS.cutscenePanel4,
    act: 'PANEL IV • IN YOUR FACE',
    caption: 'He crouches down inches from your face. Cold dead eyes pierce through you as thick cigar smoke fills your lungs.',
    dialogue: '“Now run.”',
    cueSound: () => sounds.playCigarPuff()
  },
  {
    image: IMAGE_URLS.cutscenePanel5,
    act: 'PANEL V • INTO THE ABYSS',
    caption: 'You look past the broken frame into the bottomless chasm. The labyrinth swallows the light. Everything fades to black.',
    dialogue: '[ SPRINT INTO THE VOID ]',
    cueSound: () => sounds.playDeath()
  }
];

const ENDING_SLIDES: ComicSlide[] = [
  {
    image: IMAGE_URLS.cathedralTeeth,
    act: 'EPILOGUE • THE THRESHOLD',
    caption: 'Beyond the twelfth gate, the shrieking voices of the labyrinth fall dead silent.',
    dialogue: '“You fled across your own nightmare and reached the other side.”',
    cueSound: () => sounds.playGoalFanfare()
  },
  {
    image: IMAGE_URLS.menuPortrait,
    act: 'EPILOGUE • THE MIRROR RESTORED',
    caption: 'The fractured shards mend. The smug reflection blows a final ring of smoke and closes its eyes.',
    dialogue: '“You can breathe now. Until the next headache begins.”',
    cueSound: () => sounds.playShardCollect()
  }
];

export const CutscenePlayer: React.FC<CutscenePlayerProps> = ({
  type,
  onComplete,
  reducedMotion
}) => {
  const slides = type === 'intro' ? INTRO_SLIDES : ENDING_SLIDES;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [panelFade, setPanelFade] = useState(true);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = slides[currentSlideIndex];

  // Play audio cue when slide activates
  useEffect(() => {
    currentSlide.cueSound?.();
  }, [currentSlideIndex, currentSlide]);

  // Advance to next comic slide with eye-blink transition
  const nextSlide = () => {
    if (isBlinking) return;

    if (currentSlideIndex >= slides.length - 1) {
      onComplete();
      return;
    }

    // Trigger blinking transition
    setIsBlinking(true);
    setTimeout(() => {
      setCurrentSlideIndex((prev) => prev + 1);
      setPanelFade(false);
      setTimeout(() => {
        setIsBlinking(false);
        setPanelFade(true);
      }, 350);
    }, 450);
  };

  // Auto-advance timer (6 seconds per panel)
  useEffect(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => {
      nextSlide();
    }, 6200);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [currentSlideIndex, isBlinking]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        onComplete();
      } else if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
        nextSlide();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentSlideIndex, isBlinking]);

  return (
    <div
      onClick={nextSlide}
      className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden bg-[#070504] select-none cursor-pointer"
    >
      {/* Film Grain & Comic Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)]" />

      {/* Top Header Bar: Issue & Panel Indicator */}
      <header className="w-full max-w-5xl pt-4 sm:pt-6 px-6 sm:px-10 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <span className="font-cinzel text-xs sm:text-sm font-black tracking-widest text-[#d5c29b] border border-[#524432] bg-[#140f0a]/90 px-3 py-1">
            HEADACHE • {type === 'intro' ? 'PROLOGUE COMIC' : 'EPILOGUE'}
          </span>
          <span className="font-courier text-xs text-[#9c8969] tracking-wider hidden sm:inline">
            [{currentSlideIndex + 1} / {slides.length}]
          </span>
        </div>

        {/* Skip button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="eerie-button text-xs py-1 px-4 font-courier font-bold text-[#bfa982] hover:text-[#ffffff] bg-[#17110c]/85 border-[#4a3928]"
        >
          SKIP [ESC]
        </button>
      </header>

      {/* Main Comic Panel Frame */}
      <div className="relative w-full max-w-4xl aspect-[16/9] mx-auto my-auto px-4 sm:px-8 flex items-center justify-center z-10">
        {/* Distressed Graphic Novel Heavy Ink Border */}
        <div className="relative w-full h-full border-4 sm:border-8 border-[#1a140f] shadow-[0_12px_32px_rgba(0,0,0,0.95)] overflow-hidden bg-[#0a0806]">
          {/* Comic Artwork with slow Ken Burns drift */}
          <img
            src={currentSlide.image}
            alt={currentSlide.act}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover select-none transition-transform duration-[6000ms] ease-out ${
              reducedMotion ? '' : 'scale-100 hover:scale-105'
            } ${panelFade ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
            style={{
              filter: 'contrast(1.08) brightness(0.92) sepia(0.2)'
            }}
          />

          {/* Halftone / scanline texture over comic art */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />

          {/* In-Panel Comic Act Banner */}
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-[#120d09]/95 border border-[#4a3a29] text-[#ebdcb9] text-[10px] sm:text-xs font-courier font-bold tracking-widest px-2.5 py-1 uppercase shadow-md">
              {currentSlide.act}
            </span>
          </div>

          {/* Bottom In-Panel Narrative Dialogue Box */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20">
            <div className="bg-[#140e0a]/92 border-2 border-[#544331] p-3 sm:p-4 shadow-2xl backdrop-blur-[2px]">
              <p className="font-elite text-sm sm:text-lg text-[#d5c29b] leading-relaxed tracking-wide">
                {currentSlide.caption}
              </p>
              {currentSlide.dialogue && (
                <p className="font-cinzel text-base sm:text-xl text-[#f0e3c8] font-black tracking-wide mt-2 border-l-2 border-[#b58739] pl-3 italic">
                  {currentSlide.dialogue}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Comic Controls & Slide Dots */}
      <footer className="w-full max-w-5xl pb-4 sm:pb-6 px-6 sm:px-10 flex items-center justify-between z-40 text-xs font-courier text-[#8c7a5c]">
        {/* Slide navigation dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 transition-all duration-300 ${
                idx === currentSlideIndex
                  ? 'w-6 bg-[#ebdcb9]'
                  : 'w-2 bg-[#3b2e21]'
              }`}
            />
          ))}
        </div>

        {/* Click prompt */}
        <div className="flex items-center gap-2">
          <span className="animate-pulse text-[#d5c29b] font-bold">
            CLICK or SPACE for NEXT PANEL →
          </span>
        </div>
      </footer>

      {/* Blinking Eyelid Shutter Transition */}
      <div
        className={`absolute inset-x-0 top-0 bg-[#060403] z-50 transition-all duration-300 ease-in-out pointer-events-none ${
          isBlinking ? 'h-1/2' : 'h-0'
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 bg-[#060403] z-50 transition-all duration-300 ease-in-out pointer-events-none ${
          isBlinking ? 'h-1/2' : 'h-0'
        }`}
      />
    </div>
  );
};
