// ═══════════════════════════════════════════════════════════════
// AI CHAT SERVICE
// Browser-side chat state, rate limiting, and same-origin API calls
// Server-side provider calls live in Cloudflare Pages Function /api/chat
// ═══════════════════════════════════════════════════════════════

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
  // Configuration is server-side now. The endpoint will report if it is unavailable.
  return true;
}

// ───────────────────────────────────────────────────────────────
// CHAT API
// ───────────────────────────────────────────────────────────────

/**
 * Send a message to the AI and get a response
 * @param {string} message - User's question
 * @returns {Promise<{success: boolean, content?: string, error?: string, remaining?: number}>}
 */
export async function chat(message) {
  // Check rate limit
  if (isRateLimited()) {
    return {
      success: false,
      error: `You've reached the limit of ${MAX_CONVERSATIONS_PER_SESSION} AI conversations per session. Refresh the page to start a new session, or use the commands to explore!`,
    };
  }

  try {
    // Truncate input to prevent excessive token usage
    const truncatedMessage = message.length > 1000 ? message.slice(0, 1000) : message;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: truncatedMessage,
        history: conversationHistory,
      }),
    });

    const result = await response.json().catch(() => ({
      success: false,
      error: 'Invalid response from AI endpoint.',
    }));

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.error || 'AI chat is unavailable. Please try again later.',
      };
    }

    const content = result.content;

    // Add user message and assistant response to history
    conversationHistory.push({ role: 'user', content: truncatedMessage });
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
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

// Export for status display
export { getRemainingConversations, MAX_CONVERSATIONS_PER_SESSION };
