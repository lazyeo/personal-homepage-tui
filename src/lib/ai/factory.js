// ═══════════════════════════════════════════════════════════════
// AI PROVIDER FACTORY
// Creates appropriate provider instance based on configuration
// ═══════════════════════════════════════════════════════════════

import { GeminiProvider } from './providers/gemini.js';
import { OpenAIProvider } from './providers/openai.js';
import { AnthropicProvider } from './providers/anthropic.js';

/**
 * Create AI provider instance based on configuration
 * @param {Object} config - Provider configuration
 * @param {string} config.provider - Provider type: 'gemini' | 'openai' | 'anthropic'
 * @param {string} config.apiKey - API key for authentication
 * @param {string} config.baseUrl - Base URL (optional for official APIs, required for relays)
 * @param {string} config.model - Model name
 * @returns {BaseProvider} - Provider instance
 * @throws {Error} - If provider type is invalid
 */
export function createProvider(config) {
  const { provider, apiKey, baseUrl, model } = config;

  if (!provider) {
    throw new Error('Provider type is required');
  }

  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (!model) {
    throw new Error('Model name is required');
  }

  const providerConfig = { apiKey, baseUrl, model };

  switch (provider.toLowerCase()) {
    case 'gemini':
      return new GeminiProvider(providerConfig);

    case 'openai':
      return new OpenAIProvider(providerConfig);

    case 'anthropic':
      return new AnthropicProvider(providerConfig);

    default:
      throw new Error(
        `Unknown provider: ${provider}. Supported providers: gemini, openai, anthropic`
      );
  }
}
