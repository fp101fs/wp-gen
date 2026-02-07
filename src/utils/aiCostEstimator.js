/**
 * AI Cost Estimation Utility
 * Calculates USD cost from API response token usage
 */

// Pricing per 1M tokens (as of Feb 2025)
const AI_PRICING = {
  'gemini-pro': { input: 1.25, output: 5.00 },       // Gemini Pro (latest)
  'gemini-flash': { input: 0.075, output: 0.30 },    // Gemini Flash (latest)
  'claude-sonnet-4-5': { input: 3.00, output: 15.00 } // Claude Sonnet 4.5
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
    if (provider === 'claude-sonnet-4-5') {
      // Anthropic format: response.usage.input_tokens / output_tokens
      if (response.usage) {
        return {
          inputTokens: response.usage.input_tokens || 0,
          outputTokens: response.usage.output_tokens || 0
        };
      }
    } else if (provider === 'gemini-pro' || provider === 'gemini-flash') {
      // Google format: response.usageMetadata.promptTokenCount / candidatesTokenCount
      // Note: For Gemini, the response object has a .response property from generateContent
      const usageMetadata = response.usageMetadata || response.response?.usageMetadata;
      if (usageMetadata) {
        return {
          inputTokens: usageMetadata.promptTokenCount || 0,
          outputTokens: usageMetadata.candidatesTokenCount || 0
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

  // Convert from per-1M-tokens to actual cost
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

  // Format cost with appropriate precision
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
