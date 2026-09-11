/**
 * Procedural Web Audio Sound Engine
 * Provides authentic eerie gothic horror soundscapes without external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private heartbeatGain: GainNode | null = null;
  private heartbeatOsc: OscillatorNode | null = null;
  private isMuted: boolean = false;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private isInitialized: boolean = false;
  private musicGain: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicStepTimer: ReturnType<typeof setTimeout> | null = null;
  private currentChordIndex: number = 0;
  private activeMusicVoices: { osc: OscillatorNode; gain: GainNode }[] = [];

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.28;
      this.masterGain.connect(this.ctx.destination);

      this.startAmbientDrone();
      this.isInitialized = true;
    } catch {
      // AudioContext unavailable or restricted
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.28, this.ctx.currentTime, 0.05);
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(muted ? 0 : 0.22, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Starts the procedural eerie gothic soundtrack with slow evolving minor pads,
   * cavernous wind, and fragile antique music box melodies.
   */
  public startEerieSoundtrack() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.isMusicPlaying) return;

    try {
      this.isMusicPlaying = true;
      if (!this.musicGain) {
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.isMuted ? 0 : 0.22;

        this.musicFilter = this.ctx.createBiquadFilter();
        this.musicFilter.type = 'lowpass';
        this.musicFilter.frequency.value = 450;
        this.musicFilter.Q.value = 1.2;

        this.musicFilter.connect(this.musicGain);
        this.musicGain.connect(this.masterGain);
      } else {
        this.musicGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.22, this.ctx.currentTime, 0.5);
      }

      this.currentChordIndex = 0;
      this.playNextMusicBar();
    } catch {
      // Audio restriction
    }
  }

  public stopEerieSoundtrack() {
    this.isMusicPlaying = false;
    if (this.musicStepTimer) {
      clearTimeout(this.musicStepTimer);
      this.musicStepTimer = null;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.6);
    }
    // Clean up active oscillators
    const now = this.ctx ? this.ctx.currentTime : 0;
    for (const voice of this.activeMusicVoices) {
      try {
        voice.gain.gain.setTargetAtTime(0, now, 0.4);
        voice.osc.stop(now + 0.5);
      } catch {}
    }
    this.activeMusicVoices = [];
  }

  private playNextMusicBar() {
    if (!this.isMusicPlaying || !this.ctx || !this.musicFilter) return;

    try {
      const now = this.ctx.currentTime;
      const barDuration = 4.8; // Seconds per slow eerie measure

      // Gothic chord progression (D minor, Bb maj7, G# diminished, A minor harmonic, F minor, C# diminished)
      const chords = [
        [73.42, 110.0, 146.83, 174.61], // D2, A2, D3, F3 (Dm)
        [58.27, 116.54, 146.83, 174.61], // Bb1, Bb2, D3, F3 (Bb)
        [51.91, 103.83, 123.47, 155.56], // G#1, G#2, B2, D#3 (G#dim)
        [55.0, 110.0, 164.81, 220.0],   // A1, A2, E3, A3 (Am harmonic)
        [43.65, 87.31, 130.81, 174.61],  // F1, F2, C3, F3 (Fm)
        [69.3, 103.83, 138.59, 164.81]   // C#2, G#2, C#3, E3 (C#dim)
      ];

      const currentChord = chords[this.currentChordIndex % chords.length];
      this.currentChordIndex++;

      // Create rich dual-oscillator voices for this pad
      for (let i = 0; i < currentChord.length; i++) {
        const freq = currentChord[i];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Alternate waveforms for warm hollow timbre
        osc.type = i === 0 ? 'triangle' : i === 1 ? 'sawtooth' : 'sine';
        // Subtle human detuning
        osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.8, now);

        // Slow swelling pad envelope
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.065 / currentChord.length, now + 1.2);
        gain.gain.setValueAtTime(0.065 / currentChord.length, now + barDuration - 1.2);
        gain.gain.linearRampToValueAtTime(0.001, now + barDuration);

        osc.connect(gain);
        gain.connect(this.musicFilter);

        osc.start(now);
        osc.stop(now + barDuration + 0.1);

        this.activeMusicVoices.push({ osc, gain });
      }

      // Occasional haunting music box bell chime (high fragile notes)
      const chimePool = [587.33, 698.46, 880.0, 987.77, 1046.5, 1174.66, 1396.91];
      const numChimes = Math.floor(Math.random() * 3) + 1;
      for (let c = 0; c < numChimes; c++) {
        const chimeTime = now + 0.6 + Math.random() * (barDuration - 1.8);
        const chimeFreq = chimePool[Math.floor(Math.random() * chimePool.length)];

        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chimeOsc.type = 'triangle';
        chimeOsc.frequency.setValueAtTime(chimeFreq, chimeTime);

        chimeGain.gain.setValueAtTime(0.001, chimeTime);
        chimeGain.gain.linearRampToValueAtTime(0.035, chimeTime + 0.04);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 1.8);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.musicFilter);

        chimeOsc.start(chimeTime);
        chimeOsc.stop(chimeTime + 1.85);

        this.activeMusicVoices.push({ osc: chimeOsc, gain: chimeGain });
      }

      // Prune dead voice references
      setTimeout(() => {
        this.activeMusicVoices = this.activeMusicVoices.filter((v) => {
          try {
            return (v.osc as unknown as { playbackState?: number }).playbackState !== 3;
          } catch {
            return false;
          }
        });
      }, (barDuration + 0.2) * 1000);

      // Schedule next measure
      this.musicStepTimer = setTimeout(() => {
        this.playNextMusicBar();
      }, (barDuration - 0.4) * 1000); // 400ms crossfade overlap
    } catch {
      // Audio step failure
    }
  }

  private startAmbientDrone() {
    if (!this.ctx || !this.masterGain) return;

    try {
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.value = 0.12;
      this.droneGain.connect(this.masterGain);

      // Low ominous sub-bass drone
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sawtooth';
      this.droneOsc1.frequency.value = 42; // Low E

      // Filter for dark, muffled room tone
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 110;

      // Slight detuned harmonic
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.value = 63.5;

      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(this.droneGain);

      this.droneOsc1.start();
      this.droneOsc2.start();
    } catch {
      // Drone failed to start
    }
  }

  public playFootstep() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(65 + Math.random() * 20, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  public playJump() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(290, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  public playDoubleJump() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  public playDash() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // White noise burst + pitch bend
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.18);
      filter.Q.value = 3;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
    } catch {}
  }

  public playGlassShatter() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // High chaotic harmonics
      const freqs = [1200, 1850, 2400, 3100, 4200];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq + Math.random() * 200, now + idx * 0.01);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.45);

        gain.gain.setValueAtTime(0.22, now + idx * 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + idx * 0.01);
        osc.stop(now + 0.48);
      });
    } catch {}
  }

  public playPunch() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.2);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  public playCigarPuff() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Soft ember crackle + breath
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.6);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.62);
    } catch {}
  }

  public playKeeperChime() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      [330, 440, 554, 659].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.25);
      });
    } catch {}
  }

  public playWrongAnswer() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, now);
      osc1.frequency.exponentialRampToValueAtTime(45, now + 0.8);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(116, now); // Dissonant minor second
      osc2.frequency.exponentialRampToValueAtTime(48, now + 0.8);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.88);
      osc2.stop(now + 0.88);
    } catch {}
  }

  public playDeath() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(85, now);
      osc.frequency.exponentialRampToValueAtTime(18, now + 1.2);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.25);
    } catch {}
  }

  public playHeartbeat() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  public playShardCollect() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.14, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.4);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.42);
      });
    } catch {}
  }

  public playGoalFanfare() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      [220, 277.18, 329.63, 440, 554.37].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.18, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.2);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.25);
      });
    } catch {}
  }

  public updateHeartbeat(dangerDistance: number) {
    // Distance from closest dangerous monster: 0 to 400
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    if (dangerDistance > 320) {
      if (this.heartbeatGain) {
        this.heartbeatGain.gain.value = 0;
      }
      return;
    }

    try {
      if (!this.heartbeatGain) {
        this.heartbeatGain = this.ctx.createGain();
        this.heartbeatGain.gain.value = 0;
        this.heartbeatGain.connect(this.masterGain);
      }

      const urgency = 1 - Math.max(0, Math.min(1, dangerDistance / 320));
      this.heartbeatGain.gain.setTargetAtTime(urgency * 0.22, this.ctx.currentTime, 0.1);

      if (!this.heartbeatOsc) {
        this.heartbeatOsc = this.ctx.createOscillator();
        this.heartbeatOsc.type = 'sine';
        this.heartbeatOsc.frequency.value = 55;
        this.heartbeatOsc.connect(this.heartbeatGain);
        this.heartbeatOsc.start();
      }
    } catch {}
  }
}

export const sounds = new SoundEngine();
