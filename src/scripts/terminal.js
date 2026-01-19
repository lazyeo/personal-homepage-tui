// ═══════════════════════════════════════════════════════════════
// TERMINAL CONTROLLER
// Handles input, output, typewriter effects, and suggestions
// ═══════════════════════════════════════════════════════════════

import { executeCommand, commandList } from './commands.js';

// Configuration
const TYPEWRITER_SPEED = 30; // ms per character
const WELCOME_MESSAGE = "Welcome! Type '/help' to see available commands.";

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

  // Listen for theme changes
  window.addEventListener('theme-changed', (e) => {
    const { theme } = e.detail;
    appendOutput(`<div class="output__line">Theme changed to <span class="output__line--accent">${theme}</span></div>`);
  });

  // Focus input on click anywhere in terminal
  terminalContentEl?.addEventListener('click', (e) => {
    if (e.target === terminalContentEl || e.target === outputEl) {
      inputEl.focus();
    }
  });

  // Show welcome message with typewriter effect
  typewriterEffect(WELCOME_MESSAGE, () => {
    inputEl.focus();
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
  // Echo the command
  appendOutput(`<div class="output__line"><span class="output__line--accent">$</span> ${escapeHtml(command)}</div>`);

  // Execute and get result
  const result = executeCommand(command);

  // Handle special commands
  if (result === '__CLEAR__') {
    clearTerminal();
    return;
  }

  // Append result
  if (result) {
    appendOutput(result);
  }

  // Scroll to bottom
  scrollToBottom();
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
  terminalContentEl.scrollTop = terminalContentEl.scrollHeight;
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

// ───────────────────────────────────────────────────────────────
// UTILITIES
// ───────────────────────────────────────────────────────────────

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
