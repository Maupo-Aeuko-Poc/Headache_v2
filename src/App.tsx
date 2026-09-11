/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  GameSettings,
  BiomeConfig,
  RiddleGate
} from './types';
import { BIOMES } from './game/biomes';
import { RIDDLES } from './game/riddles';
import { sounds } from './audio/soundEngine';
import { MainMenu } from './components/MainMenu';
import { GameCanvas } from './components/GameCanvas';
import { CutscenePlayer } from './components/CutscenePlayer';
import { SettingsModal } from './components/SettingsModal';
import { RiddleModal } from './components/RiddleModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { ExitedScreen } from './components/ExitedScreen';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('headache_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      resolution: 1,
      difficulty: 'nightmare',
      mute: false,
      reducedMotion: false
    };
  });

  const [bestDistance, setBestDistance] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('headache_best') || '0', 10);
    } catch {}
    return 0;
  });

  // Active game run states
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const [currentBiome, setCurrentBiome] = useState<BiomeConfig>(BIOMES[0]);
  const [dashCooldown, setDashCooldown] = useState<number>(0);
  const [deathReason, setDeathReason] = useState<string>('');
  const [activeGate, setActiveGate] = useState<RiddleGate | null>(null);
  const [activeRiddle, setActiveRiddle] = useState(RIDDLES[0]);
  const [currentSeed, setCurrentSeed] = useState<number>(Date.now());
  const previousStateRef = useRef<GameState>('menu');
  const warpMetersRef = useRef<number | null>(null);

  // Save settings & mute synchronization
  useEffect(() => {
    try {
      localStorage.setItem('headache_settings', JSON.stringify(settings));
    } catch {}
    sounds.setMute(settings.mute);
  }, [settings]);

  // Audio unlock on user interaction
  const ensureAudio = useCallback(() => {
    sounds.init();
  }, []);

  // Update game settings
  const handleUpdateSettings = (partial: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } catch {}
  };

  // Handle Play ("Run") - Plays the prologue and enters the run
  const handleStartRun = useCallback(() => {
    ensureAudio();
    sounds.playGlassShatter();
    setActiveGate(null);
    setGameState('intro');
  }, [ensureAudio]);

  // Skip or complete intro cutscene -> enters main game
  const handleIntroComplete = useCallback(() => {
    setGameState('play');
    setActiveGate(null);
  }, []);

  // Handle Settings ("Breathe")
  const handleOpenSettings = useCallback(() => {
    ensureAudio();
    previousStateRef.current = gameState;
    setGameState('settings');
  }, [ensureAudio, gameState]);

  // Handle Exit ("Die")
  const handleDieExit = useCallback(() => {
    ensureAudio();
    try {
      window.close();
    } catch {}
    setGameState('exited');
  }, [ensureAudio]);

  // Handle in-game death
  const handlePlayerDeath = useCallback((reason: string, distance: number) => {
    setDeathReason(reason);
    setCurrentDistance(distance);
    setBestDistance((prev) => {
      const nextBest = Math.max(prev, distance);
      try {
        localStorage.setItem('headache_best', nextBest.toString());
      } catch {}
      return nextBest;
    });
    setGameState('gameover');
  }, []);

  // Handle reaching 50,000 meters -> ending cutscene!
  const handleReachGoal = useCallback(() => {
    setBestDistance(50000);
    try {
      localStorage.setItem('headache_best', '50000');
    } catch {}
    setGameState('ending');
  }, []);

  // Ending cutscene completed -> returns to menu
  const handleEndingComplete = useCallback(() => {
    setGameState('menu');
  }, []);

  // Pause
  const handlePause = useCallback(() => {
    if (gameState === 'play') {
      setGameState('paused');
    }
  }, [gameState]);

  const handleResume = useCallback(() => {
    setGameState('play');
  }, []);

  // Riddle gate trigger
  const handleAskRiddle = useCallback((gate: RiddleGate) => {
    setActiveGate(gate);
    setActiveRiddle(RIDDLES[gate.riddleIndex % RIDDLES.length]);
    sounds.playKeeperChime();
    setGameState('riddle');
  }, []);

  // Riddle answer chosen
  const handleAnswerRiddle = useCallback((chosenIndex: number) => {
    if (chosenIndex === activeRiddle.correctIndex) {
      // Correct!
      sounds.playKeeperChime();
      if (activeGate) {
        activeGate.solved = true;
      }
      setActiveGate(null);
      setGameState('play');
    } else {
      // Wrong!
      sounds.playWrongAnswer();
      handlePlayerDeath('You gave the room the wrong name.', currentDistance);
    }
  }, [activeRiddle, activeGate, handlePlayerDeath, currentDistance]);

  // Fast-travel / Biome warp from settings
  const handleWarpDistance = useCallback((meters: number) => {
    warpMetersRef.current = meters;
    setGameState('play');
  }, []);

  // Continuous HUD stat updates
  const handleUpdateStats = useCallback((dist: number, biome: BiomeConfig, cd: number) => {
    setCurrentDistance(dist);
    setCurrentBiome(biome);
    setDashCooldown(cd);
  }, []);

  // Global keydown (Escape to pause / unpause)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      ensureAudio();
      if (e.code === 'Escape') {
        if (gameState === 'play') {
          handlePause();
        } else if (gameState === 'paused') {
          handleResume();
        } else if (gameState === 'settings') {
          setGameState(previousStateRef.current);
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState, ensureAudio]);

  // Touch control handlers
  const handleTouchKeyDown = (key: string) => {
    ensureAudio();
    window.dispatchEvent(new CustomEvent('game:keydown', { detail: key }));
  };

  const handleTouchKeyUp = (key: string) => {
    window.dispatchEvent(new CustomEvent('game:keyup', { detail: key }));
  };

  return (
    <div
      onClick={ensureAudio}
      className="relative w-screen h-screen overflow-hidden bg-[#070605] flex items-center justify-center font-elite select-none"
    >
      {/* 1. Main Menu View */}
      {gameState === 'menu' && (
        <MainMenu
          onRun={handleStartRun}
          onBreathe={handleOpenSettings}
          onDie={handleDieExit}
          highScore={bestDistance}
          reducedMotion={settings.reducedMotion}
        />
      )}

      {/* 2. Intro Cutscene */}
      {gameState === 'intro' && (
        <CutscenePlayer
          type="intro"
          onComplete={handleIntroComplete}
          reducedMotion={settings.reducedMotion}
          resolution={settings.resolution}
        />
      )}

      {/* 3. Ending Cutscene (50,000m) */}
      {gameState === 'ending' && (
        <CutscenePlayer
          type="ending"
          onComplete={handleEndingComplete}
          reducedMotion={settings.reducedMotion}
          resolution={settings.resolution}
        />
      )}

      {/* 4. Active Gameplay Canvas (Keeps mounted during play, paused, and riddle) */}
      {(gameState === 'play' ||
        gameState === 'paused' ||
        gameState === 'riddle' ||
        gameState === 'gameover') && (
        <>
          <GameCanvas
            difficulty={settings.difficulty}
            resolution={settings.resolution}
            reducedMotion={settings.reducedMotion}
            onDie={handlePlayerDeath}
            onAskRiddle={handleAskRiddle}
            onReachGoal={handleReachGoal}
            activeGate={activeGate}
            onUpdateStats={handleUpdateStats}
            warpMetersRef={warpMetersRef}
          />

          {/* HUD Overlay */}
          <HUD
            distance={currentDistance}
            maxGoal={50000}
            biome={currentBiome}
            dashCooldown={dashCooldown}
            maxDashCooldown={0.85}
            onPause={handlePause}
          />

          {/* Mobile Touch Controls */}
          <TouchControls
            onPressKey={handleTouchKeyDown}
            onReleaseKey={handleTouchKeyUp}
          />
        </>
      )}

      {/* 5. Riddle Modal Dialog */}
      {gameState === 'riddle' && (
        <RiddleModal
          riddle={activeRiddle}
          onAnswer={handleAnswerRiddle}
        />
      )}

      {/* 6. Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onSettings={handleOpenSettings}
          onQuit={() => setGameState('menu')}
        />
      )}

      {/* 7. Game Over Modal */}
      {gameState === 'gameover' && (
        <GameOverModal
          reason={deathReason}
          distance={currentDistance}
          best={bestDistance}
          seed={currentSeed}
          onRetry={() => {
            setCurrentSeed(Date.now());
            setGameState('play');
            setActiveGate(null);
          }}
          onMenu={() => setGameState('menu')}
        />
      )}

      {/* 8. Settings ("Breathe") Modal */}
      {gameState === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setGameState(previousStateRef.current)}
          onToggleFullscreen={handleToggleFullscreen}
          onWarpDistance={handleWarpDistance}
        />
      )}

      {/* 9. Exited Screen ("Die") */}
      {gameState === 'exited' && (
        <ExitedScreen onStay={() => setGameState('menu')} />
      )}
    </div>
  );
}
