// ═══════════════════════════════════════════════════════════════
// TERMINAL CONTROLLER
// Handles input, output, typewriter effects, and suggestions
// ═══════════════════════════════════════════════════════════════

import { executeCommand, commandList } from './commands.js';
import { playKeySound, playEnterSound } from './sound.js';

// Configuration
const TYPEWRITER_SPEED = 30; // ms per character
const WELCOME_MESSAGE = `Welcome! Available commands:
<span class="cmd-link" data-cmd="/help">/help</span> <span class="cmd-link" data-cmd="/about">/about</span> <span class="cmd-link" data-cmd="/skills">/skills</span> <span class="cmd-link" data-cmd="/projects">/projects</span> <span class="cmd-link" data-cmd="/contact">/contact</span> <span class="cmd-link" data-cmd="/clear">/clear</span>`;

// DOM Elements
let outputEl;
let inputEl;
let suggestionsEl;
let terminalContentEl;

// State
let commandHistory = [];
let historyIndex = -1;
let suggestionIndex = -1;
let currentSuggestions = [];

// ───────────────────────────────────────────────────────────────
// INITIALIZATION
// ───────────────────────────────────────────────────────────────

export function initTerminal() {
  outputEl = document.getElementById('output');
  inputEl = document.getElementById('command-input');
  suggestionsEl = document.getElementById('suggestions');
  terminalContentEl = document.getElementById('terminal-content');

  if (!outputEl || !inputEl) return;

  // Set up event listeners
  inputEl.addEventListener('keydown', handleKeyDown);
  inputEl.addEventListener('input', handleInput);
  inputEl.addEventListener('blur', hideSuggestions);

  // Listen for mobile command buttons
  window.addEventListener('execute-command', (e) => {
    const { command } = e.detail;
    runCommand(command);
  });

  // Focus input on click anywhere in terminal
  terminalContentEl?.addEventListener('click', (e) => {
    if (e.target === terminalContentEl || e.target === outputEl) {
      inputEl.focus();
    }
  });

  // Show welcome message with typewriter effect
  typewriterHtml(`<div class="output__line">${WELCOME_MESSAGE}</div>`, () => {
    inputEl.focus();
    bindCommandLinks();
  });
}

// ───────────────────────────────────────────────────────────────
// INPUT HANDLING
// ───────────────────────────────────────────────────────────────

function handleKeyDown(e) {
  // Handle suggestions navigation when visible
  if (currentSuggestions.length > 0 && suggestionsEl.classList.contains('suggestions--visible')) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        suggestionIndex = Math.min(suggestionIndex + 1, currentSuggestions.length - 1);
        updateSuggestionHighlight();
        return;

      case 'ArrowUp':
        e.preventDefault();
        suggestionIndex = Math.max(suggestionIndex - 1, 0);
        updateSuggestionHighlight();
        return;

      case 'Tab':
      case 'Enter':
        if (suggestionIndex >= 0) {
          e.preventDefault();
          inputEl.value = '/' + currentSuggestions[suggestionIndex];
          hideSuggestions();
          if (e.key === 'Enter') {
            // Execute the command
            const command = inputEl.value.trim();
            if (command) {
              runCommand(command);
              commandHistory.unshift(command);
              historyIndex = -1;
            }
            inputEl.value = '';
          }
          return;
        }
        break;

      case 'Escape':
        e.preventDefault();
        hideSuggestions();
        return;
    }
  }

  switch (e.key) {
    case 'Enter':
      e.preventDefault();
      playEnterSound();
      const command = inputEl.value.trim();
      if (command) {
        runCommand(command);
        commandHistory.unshift(command);
        historyIndex = -1;
      }
      inputEl.value = '';
      hideSuggestions();
      break;

    case 'ArrowUp':
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        historyIndex++;
        inputEl.value = commandHistory[historyIndex];
      }
      break;

    case 'ArrowDown':
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        inputEl.value = commandHistory[historyIndex];
      } else if (historyIndex === 0) {
        historyIndex = -1;
        inputEl.value = '';
      }
      break;

    case 'Tab':
      e.preventDefault();
      autocomplete();
      break;

    case 'Escape':
      hideSuggestions();
      break;
  }
}

function handleInput() {
  const value = inputEl.value;
  playKeySound();

  // Show all commands when just "/" is typed
  if (value === '/') {
    showSuggestions(commandList);
    return;
  }

  if (value.startsWith('/') && value.length > 1) {
    const partial = value.slice(1).toLowerCase();
    const matches = commandList.filter(cmd => cmd.startsWith(partial));

    if (matches.length > 0) {
      showSuggestions(matches);
    } else {
      hideSuggestions();
    }
  } else {
    hideSuggestions();
  }
}

// ───────────────────────────────────────────────────────────────
// COMMAND EXECUTION
// ───────────────────────────────────────────────────────────────

function runCommand(command) {
  // Fade previous content
  fadeOldContent();

  // Echo the command
  appendOutput(`<div class="output__line"><span class="output__line--accent">$</span> ${escapeHtml(command)}</div>`);

  // Execute and get result
  const result = executeCommand(command);

  // Handle special commands
  if (result === '__CLEAR__') {
    clearTerminal();
    return;
  }

  if (result === '__CONSOLE__') {
    showAudioConsole();
    return;
  }

  // Append result with typewriter effect (skip if null - silent commands like theme)
  if (result) {
    typewriterHtml(result);
  }
}

function fadeOldContent() {
  // Add faded class to all existing content in output
  const existingContent = outputEl.querySelectorAll(':scope > div:not(.output--faded)');
  existingContent.forEach(el => {
    el.classList.add('output--faded');
  });
}

function appendOutput(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  outputEl.appendChild(div);
  scrollToBottom();
}

function clearTerminal() {
  outputEl.innerHTML = '';
}

function scrollToBottom() {
  // Scroll to show new content at top of viewport
  // by scrolling the container to the bottom
  terminalContentEl.scrollTop = terminalContentEl.scrollHeight;
}

// Scroll new content to top of viewport (push old content up)
function scrollNewContentToTop() {
  // Get the last added content block
  const lastChild = outputEl.lastElementChild;
  if (lastChild) {
    // Scroll so the new content appears at the top of the visible area
    lastChild.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
}

// ───────────────────────────────────────────────────────────────
// SUGGESTIONS
// ───────────────────────────────────────────────────────────────

function showSuggestions(matches) {
  currentSuggestions = matches.slice(0, 7);
  suggestionIndex = 0; // Auto-select first item

  suggestionsEl.innerHTML = currentSuggestions
    .map((cmd, i) => `
      <div class="suggestions__item${i === 0 ? ' suggestions__item--active' : ''}" data-command="${cmd}" data-index="${i}">
        ${cmd}
      </div>
    `)
    .join('');

  suggestionsEl.classList.add('suggestions--visible');

  // Add click handlers
  suggestionsEl.querySelectorAll('.suggestions__item').forEach(item => {
    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
      inputEl.value = '/' + item.dataset.command;
      hideSuggestions();
      inputEl.focus();
    });
  });
}

function updateSuggestionHighlight() {
  const items = suggestionsEl.querySelectorAll('.suggestions__item');
  items.forEach((item, i) => {
    if (i === suggestionIndex) {
      item.classList.add('suggestions__item--active');
    } else {
      item.classList.remove('suggestions__item--active');
    }
  });
}

function hideSuggestions() {
  suggestionsEl.classList.remove('suggestions--visible');
  currentSuggestions = [];
  suggestionIndex = -1;
}

function autocomplete() {
  const value = inputEl.value.trim();
  if (value.startsWith('/')) {
    const partial = value.slice(1).toLowerCase();
    const match = commandList.find(cmd => cmd.startsWith(partial));
    if (match) {
      inputEl.value = '/' + match;
      hideSuggestions();
    }
  }
}

// ───────────────────────────────────────────────────────────────
// TYPEWRITER EFFECT
// ───────────────────────────────────────────────────────────────

function typewriterEffect(text, callback) {
  const container = document.createElement('div');
  container.className = 'output__line typewriter';
  outputEl.appendChild(container);

  let i = 0;
  const cursor = document.createElement('span');
  cursor.className = 'command-line__cursor';
  container.appendChild(cursor);

  function type() {
    if (i < text.length) {
      container.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
      setTimeout(type, TYPEWRITER_SPEED);
    } else {
      cursor.remove();
      if (callback) callback();
    }
  }

  type();
}

// Typewriter effect for HTML content - reveals block by block, then char by char
async function typewriterHtml(html, callback) {
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = html;

  // Get top-level elements (blocks like ascii-box, output__line, etc.)
  const blocks = Array.from(tempContainer.children);

  for (const block of blocks) {
    // Clone the block and add to output
    const blockClone = block.cloneNode(true);

    // Collect all text nodes in this block
    const textNodes = [];
    function collectTextNodes(node) {
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
          textNodes.push({ node: child, text: child.textContent });
          child.textContent = '';
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          collectTextNodes(child);
        }
      });
    }
    collectTextNodes(blockClone);

    // Add block to output
    outputEl.appendChild(blockClone);
    scrollNewContentToTop();

    // Type out text in this block
    const debug = window.__audioDebugParams;
    const interval = debug?.interval || 20;
    const speed = debug?.speed || 5;

    for (const { node, text } of textNodes) {
      for (let i = 0; i < text.length; i++) {
        node.textContent += text[i];
        if (i % interval === 0) {
          playKeySound();
        }
        await sleep(speed);
      }
    }

    // Small pause between blocks
    await sleep(30);
  }

  scrollNewContentToTop();
  bindCommandLinks();
  if (callback) callback();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ───────────────────────────────────────────────────────────────
// CLICKABLE COMMAND LINKS
// ───────────────────────────────────────────────────────────────

function bindCommandLinks() {
  document.querySelectorAll('.cmd-link:not([data-bound])').forEach(link => {
    link.setAttribute('data-bound', 'true');
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cmd = link.dataset.cmd;
      if (cmd) {
        runCommand(cmd);
      }
    });
  });
}

// ───────────────────────────────────────────────────────────────
// AUDIO DEBUG CONSOLE
// ───────────────────────────────────────────────────────────────

function showAudioConsole() {
  // Remove existing console if any
  const existing = document.getElementById('audio-console');
  if (existing) existing.remove();

  const console = document.createElement('div');
  console.id = 'audio-console';
  console.innerHTML = `
    <style>
      #audio-console {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        padding: 1rem;
        z-index: 10000;
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--text-primary);
        min-width: 320px;
        max-height: 90vh;
        overflow-y: auto;
      }
      #audio-console h3 {
        color: var(--accent-primary);
        margin-bottom: 0.75rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px dashed var(--border-color);
        padding-bottom: 0.5rem;
      }
      #audio-console .close-btn {
        background: none;
        border: 1px solid var(--border-color);
        color: var(--text-muted);
        cursor: pointer;
        font-size: 0.8rem;
        padding: 0.1rem 0.4rem;
      }
      #audio-console .close-btn:hover {
        color: var(--accent-primary);
        border-color: var(--accent-primary);
      }
      #audio-console .row {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
        gap: 0.5rem;
      }
      #audio-console .row label {
        flex: 0 0 80px;
        color: var(--text-secondary);
      }
      #audio-console input[type="range"] {
        flex: 1;
        height: 4px;
        background: var(--border-color);
        outline: none;
        -webkit-appearance: none;
      }
      #audio-console input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        background: var(--accent-primary);
        cursor: pointer;
      }
      #audio-console input[type="number"] {
        width: 60px;
        padding: 0.2rem 0.3rem;
        background: var(--bg-primary);
        color: var(--accent-primary);
        border: 1px solid var(--border-color);
        font-family: inherit;
        font-size: inherit;
        text-align: right;
      }
      #audio-console input[type="number"]:focus {
        border-color: var(--accent-primary);
        outline: none;
      }
      #audio-console .select-wrapper {
        flex: 1;
        position: relative;
      }
      #audio-console .custom-select {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        padding: 0.2rem 0.3rem;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      #audio-console .custom-select:hover {
        border-color: var(--accent-primary);
      }
      #audio-console .custom-select .arrow {
        color: var(--text-muted);
        font-size: 0.6rem;
      }
      #audio-console .custom-select-options {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-top: none;
        z-index: 10;
      }
      #audio-console .custom-select-options.open {
        display: block;
      }
      #audio-console .custom-select-option {
        padding: 0.2rem 0.3rem;
        cursor: pointer;
        color: var(--text-secondary);
      }
      #audio-console .custom-select-option:hover {
        background: var(--bg-secondary);
        color: var(--accent-primary);
      }
      #audio-console .custom-select-option.selected {
        color: var(--accent-primary);
      }
      #audio-console .custom-select-option.selected::before {
        content: '> ';
      }
      #audio-console .unit {
        color: var(--text-muted);
        font-size: 0.7rem;
        width: 30px;
      }
      #audio-console .section {
        color: var(--accent-primary);
        margin: 0.75rem 0 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px dashed var(--border-color);
      }
      #audio-console .buttons {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
      }
      #audio-console button {
        flex: 1;
        padding: 0.4rem;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        cursor: pointer;
        font-family: inherit;
        font-size: inherit;
      }
      #audio-console button:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
      }
      #audio-console button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      #audio-console .output {
        margin-top: 0.75rem;
        padding: 0.5rem;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        font-size: 0.65rem;
        color: var(--text-muted);
        white-space: pre-wrap;
        word-break: break-all;
        max-height: 100px;
        overflow-y: auto;
      }
    </style>
    <h3>
      ┌─ Audio Debug ─┐
      <button class="close-btn" onclick="document.getElementById('audio-console').remove()">[×]</button>
    </h3>

    <div class="section">── Sound Parameters ──</div>

    <div class="row">
      <label>Wave</label>
      <div class="select-wrapper">
        <div class="custom-select" id="ac-wave-select">
          <span class="value">sine</span>
          <span class="arrow">▼</span>
        </div>
        <div class="custom-select-options" id="ac-wave-options">
          <div class="custom-select-option selected" data-value="sine">sine</div>
          <div class="custom-select-option" data-value="square">square</div>
          <div class="custom-select-option" data-value="triangle">triangle</div>
          <div class="custom-select-option" data-value="sawtooth">sawtooth</div>
        </div>
        <input type="hidden" id="ac-wave" value="sine">
      </div>
    </div>

    <div class="row">
      <label>Frequency</label>
      <input type="range" id="ac-freq" min="50" max="800" value="175">
      <input type="number" id="ac-freq-num" min="50" max="800" value="175">
      <span class="unit">Hz</span>
    </div>

    <div class="row">
      <label>Variation</label>
      <input type="range" id="ac-freq-var" min="0" max="200" value="70">
      <input type="number" id="ac-freq-var-num" min="0" max="200" value="70">
      <span class="unit">±Hz</span>
    </div>

    <div class="row">
      <label>Duration</label>
      <input type="range" id="ac-dur" min="10" max="500" value="150">
      <input type="number" id="ac-dur-num" min="10" max="500" value="150">
      <span class="unit">ms</span>
    </div>

    <div class="row">
      <label>Volume</label>
      <input type="range" id="ac-vol" min="1" max="30" value="3">
      <input type="number" id="ac-vol-num" min="1" max="30" value="3" step="0.5">
      <span class="unit">%</span>
    </div>

    <div class="section">── Playback Settings ──</div>

    <div class="row">
      <label>Interval</label>
      <input type="range" id="ac-interval" min="1" max="30" value="15">
      <input type="number" id="ac-interval-num" min="1" max="30" value="15">
      <span class="unit">chars</span>
    </div>

    <div class="row">
      <label>Type Speed</label>
      <input type="range" id="ac-speed" min="1" max="30" value="5">
      <input type="number" id="ac-speed-num" min="1" max="30" value="5">
      <span class="unit">ms</span>
    </div>

    <div class="buttons">
      <button id="ac-test-once">▶ Once</button>
      <button id="ac-test-seq">▶▶ Sequence</button>
      <button id="ac-stop">■ Stop</button>
    </div>
    <div class="buttons">
      <button id="ac-copy">Copy Code</button>
      <button id="ac-apply">Apply Live</button>
    </div>

    <div class="output" id="ac-output">// Adjust parameters and test</div>
  `;

  document.body.appendChild(console);

  // Sync slider and number inputs
  function syncInputs(sliderId, numId) {
    const slider = document.getElementById(sliderId);
    const num = document.getElementById(numId);
    slider.oninput = () => num.value = slider.value;
    num.oninput = () => slider.value = num.value;
  }

  syncInputs('ac-freq', 'ac-freq-num');
  syncInputs('ac-freq-var', 'ac-freq-var-num');
  syncInputs('ac-dur', 'ac-dur-num');
  syncInputs('ac-vol', 'ac-vol-num');
  syncInputs('ac-interval', 'ac-interval-num');
  syncInputs('ac-speed', 'ac-speed-num');

  // Custom select dropdown
  const waveSelect = document.getElementById('ac-wave-select');
  const waveOptions = document.getElementById('ac-wave-options');
  const waveInput = document.getElementById('ac-wave');

  waveSelect.onclick = (e) => {
    e.stopPropagation();
    waveOptions.classList.toggle('open');
  };

  document.querySelectorAll('#ac-wave-options .custom-select-option').forEach(opt => {
    opt.onclick = () => {
      const value = opt.dataset.value;
      waveInput.value = value;
      waveSelect.querySelector('.value').textContent = value;
      document.querySelectorAll('#ac-wave-options .custom-select-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      waveOptions.classList.remove('open');
    };
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => waveOptions.classList.remove('open'));

  const outputEl = document.getElementById('ac-output');
  let stopSequence = false;

  function getParams() {
    return {
      wave: document.getElementById('ac-wave').value,
      freq: parseInt(document.getElementById('ac-freq-num').value),
      freqVar: parseInt(document.getElementById('ac-freq-var-num').value),
      dur: parseInt(document.getElementById('ac-dur-num').value) / 1000,
      vol: parseInt(document.getElementById('ac-vol-num').value) / 100,
      interval: parseInt(document.getElementById('ac-interval-num').value),
      speed: parseInt(document.getElementById('ac-speed-num').value)
    };
  }

  function generateCode(p) {
    return `// sound.js - playKeySound()
const baseFreq = ${p.freq} + Math.random() * ${p.freqVar};
playBeep(baseFreq, ${p.dur.toFixed(3)}, ${p.vol.toFixed(3)}, '${p.wave}');

// terminal.js - typewriterHtml()
if (i % ${p.interval} === 0) playKeySound();
await sleep(${p.speed});`;
  }

  // Test once
  document.getElementById('ac-test-once').onclick = () => {
    const p = getParams();
    const freq = p.freq + Math.random() * p.freqVar;
    testSound(freq, p.dur, p.vol, p.wave);
    outputEl.textContent = generateCode(p);
  };

  // Test sequence
  document.getElementById('ac-test-seq').onclick = async () => {
    const p = getParams();
    stopSequence = false;
    const testText = "The quick brown fox jumps over the lazy dog.";

    document.getElementById('ac-test-seq').disabled = true;

    for (let i = 0; i < testText.length; i++) {
      if (stopSequence) break;

      if (i % p.interval === 0) {
        const freq = p.freq + Math.random() * p.freqVar;
        testSound(freq, p.dur, p.vol, p.wave);
      }
      await new Promise(r => setTimeout(r, p.speed));
    }

    document.getElementById('ac-test-seq').disabled = false;
    outputEl.textContent = generateCode(p);
  };

  // Stop
  document.getElementById('ac-stop').onclick = () => {
    stopSequence = true;
  };

  // Copy
  document.getElementById('ac-copy').onclick = () => {
    const p = getParams();
    navigator.clipboard.writeText(generateCode(p));
    outputEl.textContent = '✓ Copied to clipboard!';
  };

  // Apply live (update current session)
  document.getElementById('ac-apply').onclick = () => {
    const p = getParams();
    window.__audioDebugParams = p;
    outputEl.textContent = '✓ Applied! Type a command to test.';
  };
}

// Test sound function for debug console
function testSound(frequency, duration, volume, type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
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
    console.error('Audio test failed:', e);
  }
}

// ───────────────────────────────────────────────────────────────
// UTILITIES
// ───────────────────────────────────────────────────────────────

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
