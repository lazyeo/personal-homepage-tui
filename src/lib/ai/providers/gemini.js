// ═══════════════════════════════════════════════════════════════
// GEMINI AI PROVIDER
// Google Gemini Official API implementation
// ═══════════════════════════════════════════════════════════════

import { BaseProvider } from './base.js';

/**
 * Google Gemini Provider
 * Uses official Gemini REST API
 * API Docs: https://ai.google.dev/gemini-api/docs/text-generation
 */
export class GeminiProvider extends BaseProvider {
  constructor(config) {
    super(config);
    // Gemini API endpoint pattern: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com';
  }

  /**
   * Convert OpenAI-style messages to Gemini format
   * @param {Array} messages - OpenAI format messages
   * @returns {Object} - Gemini API request body
   */
  convertMessages(messages) {
    // Separate system message from conversation
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    // Convert to Gemini format
    const contents = conversationMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const body = { contents };

    // Add system instruction if present (Gemini 1.5+ feature)
    if (systemMessage) {
      body.systemInstruction = {
        parts: [{ text: systemMessage.content }],
      };
    }

    return body;
  }

  async chat(messages) {
    const normalizedUrl = this.normalizeBaseUrl(this.baseUrl);

    // Gemini endpoint: /v1beta/models/{model}:generateContent?key={apiKey}
    const endpoint = `${normalizedUrl}/v1beta/models/${this.model}:generateContent`;

    const requestBody = this.convertMessages(messages);

    const response = await fetch(`${endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // Extract text from Gemini response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('Empty response from Gemini API');
    }

    return content;
  }
}
