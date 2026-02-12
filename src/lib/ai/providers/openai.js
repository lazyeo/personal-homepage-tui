// ═══════════════════════════════════════════════════════════════
// OPENAI-COMPATIBLE PROVIDER
// Works with OpenAI API and compatible proxies/relays
// ═══════════════════════════════════════════════════════════════

import { BaseProvider } from './base.js';

/**
 * OpenAI-Compatible Provider
 * Supports OpenAI API and any service implementing the same interface
 * Including: OpenAI, Azure OpenAI, custom relays/proxies
 * API Docs: https://platform.openai.com/docs/api-reference/chat
 */
export class OpenAIProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://api.openai.com';
  }

  async chat(messages) {
    const normalizedUrl = this.normalizeBaseUrl(this.baseUrl);
    const endpoint = `${normalizedUrl}/v1/chat/completions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from OpenAI API');
    }

    return content;
  }
}
