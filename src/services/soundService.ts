/**
 * Web Audio API synthesizer for Pulse VIP.
 * Generates 100% reliable in-browser audio without depending on external asset CDN links.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private ringOscillator: OscillatorNode | null = null;
  private ringGain: GainNode | null = null;
  private ringInterval: number | null = null;
  private bgBgmInterval: number | null = null;
  private isBgmPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Ringing sound for outgoing calls (standard phone telephone ring pattern)
  public startOutgoingRing() {
    this.initContext();
    if (!this.ctx) return;
    this.stopRing();

    const playTone = () => {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 440;
      osc2.frequency.value = 480;

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 1.8);
      osc2.stop(this.ctx.currentTime + 1.8);
    };

    playTone();
    this.ringInterval = window.setInterval(playTone, 3500);
  }

  // Incoming call melody
  public startIncomingRing() {
    this.initContext();
    if (!this.ctx) return;
    this.stopRing();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const playMelody = () => {
      if (!this.ctx) return;
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const time = this.ctx!.currentTime + i * 0.2;
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(time);
        osc.stop(time + 0.38);
      });
    };

    playMelody();
    this.ringInterval = window.setInterval(playMelody, 2200);
  }

  public stopRing() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  // Call connected chime
  public playCallConnect() {
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // Call hangup beep
  public playCallHangup() {
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // Coin clink / Purchase SFX
  public playCoinSound() {
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // Error buzzer SFX
  public playErrorSound() {
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.setValueAtTime(130, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.28);
  }

  // Luxury Gift sending fanfare
  public playGiftFanfare() {
    this.initContext();
    if (!this.ctx) return;
    const chords = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C major arpeggio
    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = this.ctx!.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });
  }

  // VIP 3D Big Luxury Gift sound effect with epic fanfare, sparkles, and bass resonance
  public playVIP3DGiftSound(rarity: string = 'Legendary') {
    this.initContext();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Sub bass impact
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.5);
    subGain.gain.setValueAtTime(0.3, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.65);

    // Grand heroic brass/chords
    const chords = [
      [523.25, 659.25, 783.99],          // C major
      [587.33, 739.99, 880.0],           // D major
      [659.25, 830.61, 987.77],          // E major
      [783.99, 987.77, 1174.66, 1567.98] // G majestic + high octave
    ];

    chords.forEach((chord, i) => {
      const stepTime = now + i * 0.14;
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === chords.length - 1 ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, stepTime);
        gain.gain.setValueAtTime(0.12, stepTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stepTime + (i === chords.length - 1 ? 1.4 : 0.35));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(stepTime);
        osc.stop(stepTime + 1.45);
      });
    });

    // Magical coin sparkle cascade
    for (let s = 0; s < 8; s++) {
      const sparkleOsc = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      sparkleOsc.type = 'sine';
      sparkleOsc.frequency.setValueAtTime(1800 + s * 220 + Math.random() * 200, now + 0.4 + s * 0.08);
      sparkleGain.gain.setValueAtTime(0.08, now + 0.4 + s * 0.08);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65 + s * 0.08);
      sparkleOsc.connect(sparkleGain);
      sparkleGain.connect(ctx.destination);
      sparkleOsc.start(now + 0.4 + s * 0.08);
      sparkleOsc.stop(now + 0.7 + s * 0.08);
    }
  }


  // Dice roll sound
  public playDiceRoll() {
    this.initContext();
    if (!this.ctx) return;
    for (let i = 0; i < 5; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 200 + Math.random() * 300;
      const startTime = this.ctx.currentTime + i * 0.07;
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.06);
    }
  }

  // DJ Soundboard: Air Horn
  public playAirHorn() {
    this.initContext();
    if (!this.ctx) return;
    const baseFreq = 466.16; // Bb4
    [0, 0.12, 0.28, 0.42].forEach((delay) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, this.ctx!.currentTime + delay);
      gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + delay + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + delay);
      osc.stop(this.ctx!.currentTime + delay + 0.22);
    });
  }

  // DJ Soundboard: Applause / Cheering
  public playApplause() {
    this.initContext();
    if (!this.ctx) return;
    // White noise bursts
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.6));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.0;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.4);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  // DJ Soundboard: Drum Roll
  public playDrumRoll() {
    this.initContext();
    if (!this.ctx) return;
    for (let i = 0; i < 18; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 140 + Math.random() * 20;
      const startTime = this.ctx.currentTime + i * 0.05;
      gain.gain.setValueAtTime(0.12 + (i / 18) * 0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.05);
    }
  }

  // Room Background Music Synthesis Loop (Lofi Party Groove)
  public toggleBackgroundMusic(enabled: boolean) {
    this.initContext();
    if (!this.ctx) return;

    if (!enabled) {
      if (this.bgBgmInterval) {
        clearInterval(this.bgBgmInterval);
        this.bgBgmInterval = null;
      }
      this.isBgmPlaying = false;
      return;
    }

    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;

    // 4-chord chill lo-fi loop progression: Dm9 -> G13 -> Cmaj9 -> Am9
    const chordSeq = [
      [293.66, 349.23, 440.0, 523.25], // Dm7
      [196.0, 246.94, 293.66, 392.0],  // G7
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0]   // Am7
    ];
    let step = 0;

    const playChordStep = () => {
      if (!this.ctx || !this.isBgmPlaying) return;
      const currentChord = chordSeq[step % chordSeq.length];
      step++;

      currentChord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.025, this.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 1.8);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start();
        osc.stop(this.ctx!.currentTime + 1.9);
      });
    };

    playChordStep();
    this.bgBgmInterval = window.setInterval(playChordStep, 2000);
  }

  public isMusicPlaying(): boolean {
    return this.isBgmPlaying;
  }

  // ========================================================
  // ANIMATED SPLASH SCREEN CINEMATIC COUNTDOWN & ROBOTIC VOICE
  // ========================================================

  /**
   * Deep Robotic AI voice with echo & sci-fi movie spaceship reverb
   */
  public speakRobotic(text: string, pitch = 0.45, rate = 0.85) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.volume = 1;

      // Select deep english voice if present
      const voices = window.speechSynthesis.getVoices();
      const roboticVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes('google uk english male') ||
          v.name.toLowerCase().includes('daniel') ||
          v.name.toLowerCase().includes('alex') ||
          v.name.toLowerCase().includes('david') ||
          v.name.toLowerCase().includes('robot') ||
          (v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (roboticVoice) {
        utterance.voice = roboticVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Deep sub-bass countdown boom with stereo reverb delay (for "3", "2", "1")
   */
  public playCountdownBoom(stepName: string) {
    this.initContext();
    if (!this.ctx) return;

    const baseFreq = stepName === 'One' ? 110 : stepName === 'Two' ? 95 : 80;
    
    // Sub-bass pitch drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq * 1.5, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 0.9);

    // Filter to give deep rumble
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.9);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.95);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.95);

    // Reverb Echo Repeat after 220ms
    setTimeout(() => {
      if (!this.ctx) return;
      const echoOsc = this.ctx.createOscillator();
      const echoGain = this.ctx.createGain();
      echoOsc.type = 'sine';
      echoOsc.frequency.setValueAtTime(baseFreq * 0.8, this.ctx.currentTime);
      echoOsc.frequency.exponentialRampToValueAtTime(28, this.ctx.currentTime + 0.7);

      echoGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      echoGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

      echoOsc.connect(echoGain);
      echoGain.connect(this.ctx.destination);
      echoOsc.start();
      echoOsc.stop(this.ctx.currentTime + 0.7);
    }, 220);
  }

  /**
   * High-intensity sci-fi explosion / blast impact for "GO!" and "START!"
   */
  public playBlastImpact(intense = false) {
    this.initContext();
    if (!this.ctx) return;

    // Laser Riser + Impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(intense ? 0.45 : 0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.85);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.85);

    // Heartbeat double pulse
    this.playHeartbeatThump();
  }

  /**
   * Realistic double heartbeat thump
   */
  public playHeartbeatThump() {
    this.initContext();
    if (!this.ctx) return;

    [0, 0.16].forEach((delay) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, this.ctx!.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx!.currentTime + delay + 0.18);

      gain.gain.setValueAtTime(0.3, this.ctx!.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + delay + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + delay);
      osc.stop(this.ctx!.currentTime + delay + 0.22);
    });
  }

  /**
   * Soft ambient welcome melody for final screen
   */
  public playWelcomeMusic() {
    this.initContext();
    if (!this.ctx) return;

    const chords = [
      { freq: 261.63, delay: 0 },    // C4
      { freq: 329.63, delay: 0.12 }, // E4
      { freq: 392.00, delay: 0.24 }, // G4
      { freq: 523.25, delay: 0.36 }, // C5
      { freq: 659.25, delay: 0.52 }, // E5
      { freq: 783.99, delay: 0.70 }, // G5
      { freq: 1046.5, delay: 0.90 }, // C6
    ];

    chords.forEach(({ freq, delay }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + delay);
      gain.gain.setValueAtTime(0.12, this.ctx!.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + delay + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + delay);
      osc.stop(this.ctx!.currentTime + delay + 1.9);
    });
  }
}

export const soundService = new SoundService();

