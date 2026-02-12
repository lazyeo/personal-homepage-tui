// ═══════════════════════════════════════════════════════════════
// BASE AI PROVIDER
// Abstract interface for AI provider implementations
// ═══════════════════════════════════════════════════════════════

/**
 * Base class for AI providers
 * All providers must implement the chat() method
 */
export class BaseProvider {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.model = config.model;
  }

  /**
   * Send a chat message and get a response
   * @param {Array} messages - Array of message objects with role and content
   * @returns {Promise<string>} - AI response content
   * @throws {Error} - If request fails
   */
  async chat(messages) {
    throw new Error('chat() must be implemented by provider');
  }

  /**
   * Normalize base URL (remove trailing slashes and /v1 suffix)
   * @param {string} url - Base URL to normalize
   * @returns {string} - Normalized URL
   */
  normalizeBaseUrl(url) {
    return url.replace(/\/+$/, '').replace(/\/v1\/?$/, '');
  }
}
