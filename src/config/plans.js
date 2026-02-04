/**
 * Plan Configuration Constants
 * Central configuration for all pricing plans and features
 * Update Stripe price IDs here when you set up Stripe products
 */

export const STRIPE_CONFIG = {
  // Update these with your actual Stripe price IDs
  PRICE_IDS: {
    PRO_MONTHLY: 'price_1234567890', // Replace with actual Stripe price ID
    PRO_YEARLY: 'price_0987654321',  // Replace with actual Stripe price ID
    UNLIMITED_MONTHLY: 'price_abcdef123', // Replace with actual Stripe price ID
    UNLIMITED_YEARLY: 'price_fedcba321'   // Replace with actual Stripe price ID
  },
  
  // Test mode price IDs (for development)
  TEST_PRICE_IDS: {
    PRO_MONTHLY: 'price_test_pro_monthly',
    PRO_YEARLY: 'price_test_pro_yearly',
    UNLIMITED_MONTHLY: 'price_test_unlimited_monthly',
    UNLIMITED_YEARLY: 'price_test_unlimited_yearly'
  }
}

export const PLAN_LIMITS = {
  FREE: {
    MAX_EXTENSIONS_LIFETIME: 5,
    MAX_REVISIONS_PER_EXTENSION: 2,
    MAX_STORAGE_MB: 50,
    MAX_TEAM_MEMBERS: 1,
    SUPPORT_LEVEL: 'community'
  },
  
  PRO: {
    MAX_EXTENSIONS_PER_MONTH: 75,
    MAX_REVISIONS_PER_EXTENSION: 10,
    MAX_STORAGE_MB: 500,
    MAX_TEAM_MEMBERS: 3,
    SUPPORT_LEVEL: 'priority',
    TRIAL_DAYS: 7
  },
  
  UNLIMITED: {
    MAX_EXTENSIONS_PER_MONTH: -1, // Unlimited
    MAX_REVISIONS_PER_EXTENSION: -1, // Unlimited
    MAX_STORAGE_MB: -1, // Unlimited
    MAX_TEAM_MEMBERS: 10,
    SUPPORT_LEVEL: 'premium'
  }
}

export const FEATURE_FLAGS = {
  // Core features
  EXTENSION_GENERATION: 'extension_generation',
  EXTENSION_REVISION: 'extension_revision',
  
  // Premium features
  UNLIMITED_REVISIONS: 'unlimited_revisions',
  PRIORITY_SUPPORT: 'priority_support',
  CUSTOM_BRANDING: 'custom_branding',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  TEAM_COLLABORATION: 'team_collaboration',
  API_ACCESS: 'api_access',
  WEBHOOK_NOTIFICATIONS: 'webhook_notifications',
  
  // Future features
  CUSTOM_TEMPLATES: 'custom_templates',
  WHITE_LABEL: 'white_label',
  DEDICATED_SUPPORT: 'dedicated_support'
}

export const PLAN_COLORS = {
  free: {
    primary: '#6B7280', // Gray
    secondary: '#F3F4F6',
    accent: '#4B5563'
  },
  pro: {
    primary: '#7C3AED', // Purple
    secondary: '#EDE9FE',
    accent: '#5B21B6'
  },
  unlimited: {
    primary: '#059669', // Green
    secondary: '#D1FAE5',
    accent: '#047857'
  }
}

export const MARKETING_COPY = {
  FREE: {
    headline: 'Get Started Free',
    subheadline: 'Perfect for trying out the platform',
    cta: 'Start Building',
    testimonial: '"Great for learning how extensions work!" - Sarah K.',
    popular: false
  },
  
  PRO: {
    headline: 'Most Popular',
    subheadline: 'Perfect for serious developers',
    cta: 'Start 7-Day Trial',
    testimonial: '"Everything I need to build professional extensions!" - Mike R.',
    popular: true
  },
  
  UNLIMITED: {
    headline: 'Maximum Power',
    subheadline: 'For teams and power users',
    cta: 'Go Max',
    testimonial: '"Handles our entire team\'s extension needs!" - Tech Startup CEO',
    popular: false
  }
}

export const BILLING_CYCLES = {
  MONTHLY: {
    id: 'monthly',
    name: 'Monthly',
    description: 'Billed monthly',
    discount: 0
  },
  
  YEARLY: {
    id: 'yearly',
    name: 'Yearly',
    description: 'Billed annually',
    discount: 0.167, // ~17% discount (2 months free)
    savings_message: '2 months free!'
  }
}

export const USAGE_ALERTS = {
  WARNING_THRESHOLD: 0.8, // 80% usage
  CRITICAL_THRESHOLD: 0.95, // 95% usage
  
  MESSAGES: {
    WARNING: 'You\'ve used 80% of your monthly tokens',
    CRITICAL: 'You\'re almost out of tokens this month',
    DEPLETED: 'You\'ve used all your tokens for this month'
  }
}

export const UPGRADE_TRIGGERS = {
  // When to show upgrade prompts
  TOKEN_DEPLETION: {
    show_at_percentage: 90,
    message: 'Running low on tokens? Upgrade for more!'
  },
  
  FEATURE_BLOCK: {
    show_immediately: true,
    message: 'This feature is available in higher plans'
  },
  
  LIMIT_REACHED: {
    show_immediately: true,
    message: 'You\'ve reached your plan limit. Upgrade to continue!'
  }
}

// Helper functions for plan configuration
export const getPlanColor = (planType) => {
  return PLAN_COLORS[planType] || PLAN_COLORS.free
}

export const getStripePriceId = (planType, billingCycle, isTest = false) => {
  const priceIds = isTest ? STRIPE_CONFIG.TEST_PRICE_IDS : STRIPE_CONFIG.PRICE_IDS
  
  const key = `${planType.toUpperCase()}_${billingCycle.toUpperCase()}`
  return priceIds[key] || null
}

export const calculateYearlySavings = (monthlyPrice) => {
  const yearlyPrice = monthlyPrice * 12 * (1 - BILLING_CYCLES.YEARLY.discount)
  const savings = (monthlyPrice * 12) - yearlyPrice
  return Math.round(savings)
}

export const shouldShowUpgradePrompt = (usage, trigger) => {
  const config = UPGRADE_TRIGGERS[trigger]
  if (!config) return false
  
  if (config.show_immediately) return true
  
  if (config.show_at_percentage) {
    return usage >= (config.show_at_percentage / 100)
  }
  
  return false
}

export default {
  STRIPE_CONFIG,
  PLAN_LIMITS,
  FEATURE_FLAGS,
  PLAN_COLORS,
  MARKETING_COPY,
  BILLING_CYCLES,
  USAGE_ALERTS,
  UPGRADE_TRIGGERS,
  getPlanColor,
  getStripePriceId,
  calculateYearlySavings,
  shouldShowUpgradePrompt
}