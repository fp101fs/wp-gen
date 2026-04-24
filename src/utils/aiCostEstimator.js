/**
 * AI Cost Estimation Utility
 * Calculates USD cost from API response token usage
 */

// Pricing per 1M tokens (as of Feb 2025)
const AI_PRICING = {
  'gemini-3-flash': { input: 0.50, output: 3.00 },    // Gemini 3 Flash via OpenRouter
  'gemini-3-pro': { input: 2.00, output: 12.00 },     // Gemini 3 Pro via OpenRouter
  'claude-sonnet-4-5': { input: 3.00, output: 15.00 }, // Claude Sonnet 4.5
  'claude-opus-4-6': { input: 5.00, output: 25.00 },  // Claude Opus 4.6
  // OpenRouter free tier ($0 API cost)
  'openrouter/free': { input: 0, output: 0 },
  'z-ai/glm-4.5-air:free': { input: 0, output: 0 },
  'nvidia/nemotron-3-nano-30b-a3b:free': { input: 0, output: 0 },
  'liquid/lfm-2.5-1.2b-thinking-20260120:free': { input: 0, output: 0 },
  'tencent/hy3-preview-20260421:free': { input: 0, output: 0 },
  'minimax/minimax-m2.5:free': { input: 0, output: 0 },
  'google/gemma-4-31b-it:free': { input: 0, output: 0 },
  'meta-llama/llama-3.3-70b-instruct:free': { input: 0, output: 0 },
  'qwen/qwen3-next-80b-a3b-instruct:free': { input: 0, output: 0 },
};

/**
 * Extract token usage from provider response
 * @param {string} provider - The AI provider identifier
 * @param {object} response - The raw API response
 * @returns {{ inputTokens: number, outputTokens: number } | null}
 */
function extractUsage(provider, response) {
  if (!response) return null;

  try {
    if (provider === 'claude-sonnet-4-5' || provider === 'claude-opus-4-6') {
      // Anthropic format: response.usage.input_tokens / output_tokens
      if (response.usage) {
        return {
          inputTokens: response.usage.input_tokens || 0,
          outputTokens: response.usage.output_tokens || 0
        };
      }
    } else {
      // OpenRouter format (OpenAI-compatible) — Gemini and free tier models
      if (response.usage) {
        return {
          inputTokens: response.usage.prompt_tokens || 0,
          outputTokens: response.usage.completion_tokens || 0
        };
      }
    }
  } catch (error) {
    console.warn('[AI Cost] Failed to extract usage:', error.message);
  }

  return null;
}

/**
 * Calculate cost in USD from token counts
 * @param {string} provider - The AI provider identifier
 * @param {number} inputTokens - Number of input/prompt tokens
 * @param {number} outputTokens - Number of output/completion tokens
 * @returns {number} Cost in USD
 */
function calculateCost(provider, inputTokens, outputTokens) {
  const pricing = AI_PRICING[provider];
  if (!pricing) {
    console.warn(`[AI Cost] Unknown provider: ${provider}`);
    return 0;
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;

  return inputCost + outputCost;
}

/**
 * Estimate cost from API response and log to console
 * @param {string} provider - The AI provider identifier
 * @param {object} response - The raw API response
 * @returns {{ inputTokens: number, outputTokens: number, cost: number } | null}
 */
export function estimateCost(provider, response) {
  const usage = extractUsage(provider, response);

  if (!usage) {
    console.warn(`[AI Cost] Could not extract usage from ${provider} response`);
    return null;
  }

  const cost = calculateCost(provider, usage.inputTokens, usage.outputTokens);

  const formattedCost = cost < 0.01
    ? `$${cost.toFixed(6)}`
    : `$${cost.toFixed(4)}`;

  console.log(
    `[AI Cost] ${provider}: ${usage.inputTokens.toLocaleString()} input + ${usage.outputTokens.toLocaleString()} output = ${formattedCost}`
  );

  return {
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cost
  };
}
