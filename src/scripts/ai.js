// ═══════════════════════════════════════════════════════════════
// AI CHAT SERVICE
// Handles AI conversations with rate limiting and context restriction
// Supports multiple AI providers: Gemini, OpenAI-compatible, Anthropic-compatible
// ═══════════════════════════════════════════════════════════════

import { createProvider } from '../lib/ai/index.js';

// Configuration from environment variables (Astro exposes PUBLIC_ prefixed vars)
const AI_PROVIDER = import.meta.env.PUBLIC_AI_PROVIDER || 'openai';
const AI_BASE_URL = import.meta.env.PUBLIC_AI_BASE_URL || '';
const AI_API_KEY = import.meta.env.PUBLIC_AI_API_KEY || '';
const AI_MODEL = import.meta.env.PUBLIC_AI_MODEL || 'gpt-3.5-turbo';

// Import AI context from markdown file (Astro imports as raw string with ?raw)
import AI_CONTEXT from '../data/ai-context.md?raw';

// System prompt = prefix + markdown content
const SYSTEM_PROMPT = `You are an AI assistant embedded in Shaun's personal portfolio website terminal.

${AI_CONTEXT}`;

// Rate limiting (in-memory, resets on page refresh)
const MAX_CONVERSATIONS_PER_SESSION = 10;
const MAX_HISTORY_LENGTH = 10; // Keep last 10 messages (5 turns) for context

// Session state (resets on page refresh)
let conversationHistory = [];
let conversationCount = 0;

// ───────────────────────────────────────────────────────────────
// RATE LIMITING (in-memory, resets on page refresh)
// ───────────────────────────────────────────────────────────────

function getConversationCount() {
  return conversationCount;
}

function incrementConversationCount() {
  conversationCount++;
  return conversationCount;
}

function getRemainingConversations() {
  return Math.max(0, MAX_CONVERSATIONS_PER_SESSION - conversationCount);
}

function isRateLimited() {
  return conversationCount >= MAX_CONVERSATIONS_PER_SESSION;
}

// ───────────────────────────────────────────────────────────────
// API CONFIGURATION CHECK
// ───────────────────────────────────────────────────────────────

export function isAIConfigured() {
  // Only API_KEY is required (BASE_URL has defaults for each provider)
  return Boolean(AI_API_KEY);
}

// ───────────────────────────────────────────────────────────────
// CHAT API
// ───────────────────────────────────────────────────────────────

/**
 * Send a message to the AI and get a response
 * @param {string} message - User's question
 * @returns {Promise<{success: boolean, content?: string, error?: string}>}
 */
export async function chat(message) {
  // Check configuration
  if (!isAIConfigured()) {
    return {
      success: false,
      error: 'AI chat is not configured. Contact Shaun for more information.',
    };
  }

  // Check rate limit
  if (isRateLimited()) {
    return {
      success: false,
      error: `You've reached the limit of ${MAX_CONVERSATIONS_PER_SESSION} AI conversations per session. Refresh the page to start a new session, or use the commands to explore!`,
    };
  }

  try {
    // Create provider instance
    const provider = createProvider({
      provider: AI_PROVIDER,
      apiKey: AI_API_KEY,
      baseUrl: AI_BASE_URL,
      model: AI_MODEL,
    });

    // Build messages with conversation history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Get AI response using the provider
    const content = await provider.chat(messages);

    // Add user message and assistant response to history
    conversationHistory.push({ role: 'user', content: message });
    conversationHistory.push({ role: 'assistant', content });

    // Trim history to keep only recent messages
    if (conversationHistory.length > MAX_HISTORY_LENGTH) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH);
    }

    // Increment conversation count on success
    const remaining = MAX_CONVERSATIONS_PER_SESSION - incrementConversationCount();

    return {
      success: true,
      content,
      remaining,
    };
  } catch (error) {
    console.error('AI chat error:', error);
    return {
      success: false,
      error: error.message || 'Network error. Please check your connection and try again.',
    };
  }
}

// Export for status display
export { getRemainingConversations, MAX_CONVERSATIONS_PER_SESSION };
