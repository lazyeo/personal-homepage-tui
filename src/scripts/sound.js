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
function playBeep(frequency = 600, duration = 0.03, volume = 0.03) {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio not supported, fail silently
  }
}

// Mechanical typewriter sound - deeper click with slight variation
export function playKeySound() {
  if (!soundEnabled) return;

  // Lower frequency for more mechanical feel
  const baseFreq = 150 + Math.random() * 80;
  playBeep(baseFreq, 0.015, 0.02);
}

// Enter key sound - slightly different
export function playEnterSound() {
  if (!soundEnabled) return;
  playBeep(120, 0.04, 0.025);
}

// Heatmap cell fill sound - soft tick
export function playTickSound() {
  if (!soundEnabled) return;
  playBeep(300 + Math.random() * 100, 0.01, 0.015);
}
