// Audio Manager - Procedural sound generation using Web Audio API

export class AudioManager {
  constructor() {
    // Create audio context
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Master volume
      this.masterGain.connect(this.audioContext.destination);
      this.enabled = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }

    // Sound library with generation functions
    this.sounds = {
      shoot: this.generateShootSound.bind(this),
      enemyDeath: this.generateEnemyDeathSound.bind(this),
      playerHurt: this.generatePlayerHurtSound.bind(this),
      itemPickup: this.generateItemPickupSound.bind(this),
      gameOver: this.generateGameOverSound.bind(this),
      explosion: this.generateExplosionSound.bind(this),
      door: this.generateDoorSound.bind(this),
      step: this.generateStepSound.bind(this)
    };
  }

  play(soundName, volume = 1.0) {
    if (!this.enabled) return;

    // Resume audio context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    if (this.sounds[soundName]) {
      this.sounds[soundName](volume);
    }
  }

  // Generate shoot sound - quick pew
  generateShootSound(volume = 1.0) {
    const now = this.audioContext.currentTime;
    const duration = 0.1;

    // Oscillator for the tone
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + duration);

    gain.gain.setValueAtTime(0.15 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Generate enemy death sound - descending explosion
  generateEnemyDeathSound(volume = 1.0) {
    const now = this.audioContext.currentTime;
    const duration = 0.3;

    // Noise for explosion effect
    const noise = this.createNoiseBuffer();
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noise;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(2000, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, now + duration);

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.2 * volume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Bass thump
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + duration);

    oscGain.gain.setValueAtTime(0.3 * volume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }

  // Generate player hurt sound - harsh descending tone
  generatePlayerHurtSound(volume = 1.0) {
    const now = this.audioContext.currentTime;
    const duration = 0.2;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + duration);

    gain.gain.setValueAtTime(0.2 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Generate item pickup sound - ascending chime
  generateItemPickupSound(volume = 1.0) {
    const now = this.audioContext.currentTime;
    const duration = 0.15;

    // First tone
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(600, now);

    gain1.gain.setValueAtTime(0.2 * volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);

    osc1.start(now);
    osc1.stop(now + duration);

    // Second tone (harmony)
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, now + 0.05);

    gain2.gain.setValueAtTime(0.15 * volume, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + duration + 0.05);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);

    osc2.start(now + 0.05);
    osc2.stop(now + duration + 0.05);

    // Third tone (octave)
    const osc3 = this.audioContext.createOscillator();
    const gain3 = this.audioContext.createGain();

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1200, now + 0.1);

    gain3.gain.setValueAtTime(0.1 * volume, now + 0.1);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + duration + 0.1);

    osc3.connect(gain3);
    gain3.connect(this.masterGain);

    osc3.start(now + 0.1);
    osc3.stop(now + duration + 0.1);
  }

  // Generate game over sound - sad descending tones
  generateGameOverSound(volume = 1.0) {
    const now = this.audioContext.currentTime;

    // Play a series of descending tones
    const notes = [
      { freq: 440, time: 0, duration: 0.3 },
      { freq: 392, time: 0.3, duration: 0.3 },
      { freq: 349, time: 0.6, duration: 0.3 },
      { freq: 293, time: 0.9, duration: 0.6 }
    ];

    for (const note of notes) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.15 * volume, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.duration);
    }
  }

  // Generate explosion sound
  generateExplosionSound(volume = 1.0) {
    const now = this.audioContext.currentTime;
    const duration = 0.5;

    // White noise
    const noise = this.createNoiseBuffer();
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noise;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(5000, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(50, now + duration);

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.3 * volume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Low rumble
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + duration);

    oscGain.gain.setValueAtTime(0.4 * volume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }

  // Generate door sound - mechanical
  generateDoorSound(volume = 1.0) {
    const now = this.audioContext.currentTime;
    const duration = 0.2;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(150, now + duration);

    gain.gain.setValueAtTime(0.1 * volume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Generate footstep sound - short click
  generateStepSound(volume = 1.0) {
    const now = this.audioContext.currentTime;
    const duration = 0.05;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);

    gain.gain.setValueAtTime(0.05 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Helper function to create noise buffer
  createNoiseBuffer() {
    const bufferSize = this.audioContext.sampleRate * 0.5; // 0.5 seconds
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  // Set master volume
  setVolume(volume) {
    if (this.enabled) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Mute/unmute
  setMuted(muted) {
    if (this.enabled) {
      this.masterGain.gain.value = muted ? 0 : 0.3;
    }
  }
}
