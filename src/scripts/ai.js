// ═══════════════════════════════════════════════════════════════
// AI CHAT SERVICE
// Handles AI conversations with rate limiting and context restriction
// ═══════════════════════════════════════════════════════════════

// Configuration from environment variables (Astro exposes PUBLIC_ prefixed vars)
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
  return Boolean(AI_BASE_URL && AI_API_KEY);
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
    // Normalize base URL: remove trailing slash and /v1 suffix if present
    let baseUrl = AI_BASE_URL.replace(/\/+$/, '');
    if (baseUrl.endsWith('/v1')) {
      baseUrl = baseUrl.slice(0, -3);
    }

    // Build messages with conversation history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('AI API error:', response.status, errorData);
      return {
        success: false,
        error: 'Failed to get AI response. Please try again later.',
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: 'Received empty response from AI.',
      };
    }

    // Add user message and assistant response to history
    conversationHistory.push({ role: 'user', content: message });
    conversationHistory.push({ role: 'assistant', content: content });

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
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

// Export for status display
export { getRemainingConversations, MAX_CONVERSATIONS_PER_SESSION };
