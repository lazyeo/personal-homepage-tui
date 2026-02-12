// ═══════════════════════════════════════════════════════════════
// ANTHROPIC-COMPATIBLE PROVIDER
// Works with Anthropic API and compatible proxies/relays
// ═══════════════════════════════════════════════════════════════

import { BaseProvider } from './base.js';

/**
 * Anthropic-Compatible Provider
 * Supports Anthropic Messages API and compatible relays
 * API Docs: https://docs.anthropic.com/en/api/messages
 */
export class AnthropicProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com';
  }

  /**
   * Convert OpenAI-style messages to Anthropic format
   * @param {Array} messages - OpenAI format messages
   * @returns {Object} - Anthropic API request body
   */
  convertMessages(messages) {
    // Separate system message from conversation
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const body = {
      model: this.model,
      max_tokens: 1000,
      messages: conversationMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    };

    // Add system prompt if present
    if (systemMessage) {
      body.system = systemMessage.content;
    }

    return body;
  }

  async chat(messages) {
    const normalizedUrl = this.normalizeBaseUrl(this.baseUrl);
    const endpoint = `${normalizedUrl}/v1/messages`;

    const requestBody = this.convertMessages(messages);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error('Empty response from Anthropic API');
    }

    return content;
  }
}
