// ═══════════════════════════════════════════════════════════════
// SOUND EFFECTS
// Programmatic audio generation for TUI experience
// ═══════════════════════════════════════════════════════════════

let audioContext = null;
let soundEnabled = true;

// Initialize audio context on first user interaction
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Check and restore sound preference
export function initSound() {
  const saved = localStorage.getItem('soundEnabled');
  soundEnabled = saved !== 'false'; // Default to true
  updateSoundButton();
}

// Toggle sound on/off
export function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('soundEnabled', soundEnabled);
  updateSoundButton();

  // Play a short beep to confirm sound is on
  if (soundEnabled) {
    playBeep(800, 0.05);
  }
}

// Update the sound button UI
function updateSoundButton() {
  const btn = document.getElementById('sound-toggle');
  if (btn) {
    btn.setAttribute('data-enabled', soundEnabled ? 'true' : 'false');
    btn.setAttribute('aria-label', soundEnabled ? 'Mute sounds' : 'Enable sounds');
    btn.textContent = soundEnabled ? '♪' : '♪̸';
  }
}

// Check if sound is enabled
export function isSoundEnabled() {
  return soundEnabled;
}

// Play a simple beep/click sound
function playBeep(frequency = 600, duration = 0.03, volume = 0.03, type = 'sine') {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio not supported, fail silently
  }
}

// Mechanical typewriter sound - muffled, slow thud
export function playKeySound() {
  if (!soundEnabled) return;

  // Check for debug override
  const debug = window.__audioDebugParams;
  if (debug) {
    const freq = debug.freq + Math.random() * debug.freqVar;
    playBeep(freq, debug.dur, debug.vol, debug.wave);
    return;
  }

  const baseFreq = 120 + Math.random() * 10;
  playBeep(baseFreq, 0.150, 0.040, 'triangle');
}

// Enter key sound - deeper thunk
export function playEnterSound() {
  if (!soundEnabled) return;
  playBeep(100, 0.2, 0.03, 'sine');
}

// Heatmap cell fill sound - soft tick
export function playTickSound() {
  if (!soundEnabled) return;
  playBeep(200 + Math.random() * 50, 0.1, 0.015, 'sine');
}
