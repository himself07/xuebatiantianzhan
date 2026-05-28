export type SoundType =
  | 'click'
  | 'success'
  | 'error'
  | 'levelUp'
  | 'coin'
  | 'draw'
  | 'battleStart'
  | 'battleWin'
  | 'petHappy'
  | 'petSad'
  | 'pageEnter';

export class AudioManager {
  private static bgmGainNode: GainNode | null = null;
  private static bgmOscillator: OscillatorNode | null = null;
  private static bgmEnabled: boolean = true;
  private static seEnabled: boolean = true;
  private static volume: number = 0.3;

  private static audioContext: AudioContext | null = null;

  private static getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  static setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = this.volume * 0.5;
    }
  }

  static setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.stopBGM();
    } else {
      this.playBGM();
    }
  }

  static setSeEnabled(enabled: boolean) {
    this.seEnabled = enabled;
  }

  static playBGM() {
    if (!this.bgmEnabled || typeof window === 'undefined') return;

    const ctx = this.getContext();
    if (this.bgmOscillator) return;

    const gainNode = ctx.createGain();
    gainNode.gain.value = this.volume * 0.3;
    gainNode.connect(ctx.destination);
    this.bgmGainNode = gainNode;

    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    osc.type = 'sine';
    osc.frequency.value = 261.63;

    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    let noteIndex = 0;

    osc.onended = () => {};
    osc.start();

    const scheduleNextNote = () => {
      if (!this.bgmEnabled) return;
      const note = notes[noteIndex % notes.length];
      this.bgmOscillator!.frequency.setValueAtTime(note, ctx.currentTime);
      noteIndex++;
      this.bgmTimer = setTimeout(scheduleNextNote, 500) as unknown as number;
    };

    osc.connect(gainNode);
    this.bgmOscillator = osc;
    this.bgmTimer = setTimeout(scheduleNextNote, 500) as unknown as number;
  }

  private static bgmTimer: number | null = null;

  static stopBGM() {
    if (this.bgmOscillator) {
      this.bgmOscillator.stop();
      this.bgmOscillator.disconnect();
      this.bgmOscillator = null;
    }
    if (this.bgmGainNode) {
      this.bgmGainNode.disconnect();
      this.bgmGainNode = null;
    }
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  static playSound(type: SoundType) {
    if (!this.seEnabled || typeof window === 'undefined') return;

    const ctx = this.getContext();
    const gainNode = ctx.createGain();
    gainNode.gain.value = this.volume;
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'click':
        this.playTone(ctx, gainNode, 600, 0.1, 'sine');
        break;
      case 'success':
        this.playTone(ctx, gainNode, 523.25, 0.15, 'sine');
        setTimeout(() => this.playTone(ctx, gainNode, 659.25, 0.15, 'sine'), 100);
        setTimeout(() => this.playTone(ctx, gainNode, 783.99, 0.2, 'sine'), 200);
        break;
      case 'error':
        this.playTone(ctx, gainNode, 200, 0.3, 'sawtooth');
        break;
      case 'levelUp':
        this.playTone(ctx, gainNode, 523.25, 0.1, 'sine');
        setTimeout(() => this.playTone(ctx, gainNode, 659.25, 0.1, 'sine'), 80);
        setTimeout(() => this.playTone(ctx, gainNode, 783.99, 0.1, 'sine'), 160);
        setTimeout(() => this.playTone(ctx, gainNode, 1046.50, 0.3, 'sine'), 240);
        break;
      case 'coin':
        this.playTone(ctx, gainNode, 988, 0.08, 'sine');
        setTimeout(() => this.playTone(ctx, gainNode, 1319, 0.15, 'sine'), 60);
        break;
      case 'draw':
        this.playTone(ctx, gainNode, 440, 0.1, 'triangle');
        setTimeout(() => this.playTone(ctx, gainNode, 554, 0.1, 'triangle'), 80);
        setTimeout(() => this.playTone(ctx, gainNode, 659, 0.1, 'triangle'), 160);
        setTimeout(() => this.playTone(ctx, gainNode, 880, 0.2, 'triangle'), 240);
        break;
      case 'battleStart':
        this.playTone(ctx, gainNode, 220, 0.2, 'square');
        setTimeout(() => this.playTone(ctx, gainNode, 330, 0.2, 'square'), 150);
        setTimeout(() => this.playTone(ctx, gainNode, 440, 0.3, 'square'), 300);
        break;
      case 'battleWin':
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            this.playTone(ctx, gainNode, 523.25 * (1 + i * 0.25), 0.15, 'sine');
          }, i * 120);
        }
        break;
      case 'petHappy':
        this.playTone(ctx, gainNode, 800, 0.08, 'sine');
        setTimeout(() => this.playTone(ctx, gainNode, 1000, 0.1, 'sine'), 80);
        break;
      case 'petSad':
        this.playTone(ctx, gainNode, 300, 0.2, 'sine');
        setTimeout(() => this.playTone(ctx, gainNode, 250, 0.3, 'sine'), 200);
        break;
      case 'pageEnter':
        this.playTone(ctx, gainNode, 523.25, 0.08, 'sine');
        setTimeout(() => this.playTone(ctx, gainNode, 659.25, 0.08, 'sine'), 60);
        break;
    }

    setTimeout(() => gainNode.disconnect(), 1000);
  }

  private static playTone(
    ctx: AudioContext,
    gainNode: GainNode,
    frequency: number,
    duration: number,
    type: OscillatorType
  ) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    g.gain.setValueAtTime(this.volume, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(g);
    g.connect(gainNode);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }
}

export const playSound = (type: SoundType) => AudioManager.playSound(type);
export const playBGM = () => AudioManager.playBGM();
export const stopBGM = () => AudioManager.stopBGM();
export const setAudioVolume = (vol: number) => AudioManager.setVolume(vol);
export const setBgmEnabled = (enabled: boolean) => AudioManager.setBgmEnabled(enabled);
export const setSeEnabled = (enabled: boolean) => AudioManager.setSeEnabled(enabled);