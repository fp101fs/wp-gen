import { supabase, tokenApi } from '../supabaseClient'
import { tokenService } from './TokenService'
import { debugLog, debugError } from '../utils/debugUtils'

/**
 * User Type Enums and Constants
 */
export const USER_TYPES = {
  FREE: 'free',
  FREELANCER: 'freelancer',
  AGENCY: 'agency',
  ENTERPRISE: 'enterprise'
}

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  INCOMPLETE: 'incomplete',
  TRIALING: 'trialing'
}

export const PLAN_FEATURES = {
  EXTENSION_GENERATION: 'extension_generation',
  REVISION_UNLIMITED: 'revision_unlimited',
  PRIORITY_SUPPORT: 'priority_support',
  CUSTOM_BRANDING: 'custom_branding',
  TEAM_COLLABORATION: 'team_collaboration',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  API_ACCESS: 'api_access'
}

/**
 * Plan Configuration Object
 * Central source of truth for all plan details and features
 */
export const PLAN_CONFIG = {
  [USER_TYPES.FREE]: {
    id: 'free',
    name: 'Free',
    displayName: 'Free',
    description: 'Perfect for trying out the platform',
    price: {
      monthly: 0,
      yearly: 0
    },
    tokens: {
      included: 3,
      renewal: 'monthly',
      rollover: false
    },
    limits: {
      extensions_per_month: 3,
      revisions_per_extension: 2,
      storage_mb: 50,
      team_members: 1
    },
    features: [
      PLAN_FEATURES.EXTENSION_GENERATION
    ],
    restrictions: [
      'Limited to 3 plugins/month',
      'Community support only'
    ],
    cta: 'Get Started Free',
    popular: false,
    stripe_price_ids: {
      monthly: null,
      yearly: null
    }
  },

  [USER_TYPES.FREELANCER]: {
    id: 'freelancer',
    name: 'Freelancer',
    displayName: 'Freelancer',
    description: 'For individual developers and creators',
    price: {
      monthly: 99,
      yearly: 990 // 2 months free
    },
    tokens: {
      included: 500,
      renewal: 'monthly',
      rollover: false
    },
    limits: {
      extensions_per_month: 500,
      revisions_per_extension: -1, // Unlimited
      storage_mb: 500,
      team_members: 1
    },
    features: [
      PLAN_FEATURES.EXTENSION_GENERATION,
      PLAN_FEATURES.REVISION_UNLIMITED
    ],
    restrictions: [],
    cta: 'Start Freelancer',
    popular: true,
    stripe_price_ids: {
      monthly: 'price_1SxSVzLkI17DtQuz6gzXKUWK',
      yearly: 'price_1SxSZfLkI17DtQuzSxLw6p3d'
    }
  },

  [USER_TYPES.AGENCY]: {
    id: 'agency',
    name: 'Agency',
    displayName: 'Agency',
    description: 'For teams and agencies',
    price: {
      monthly: 299,
      yearly: 2990 // 2 months free
    },
    tokens: {
      included: 2000,
      renewal: 'monthly',
      rollover: false
    },
    limits: {
      extensions_per_month: 2000,
      revisions_per_extension: -1, // Unlimited
      storage_mb: 2000,
      team_members: 5
    },
    features: [
      PLAN_FEATURES.EXTENSION_GENERATION,
      PLAN_FEATURES.REVISION_UNLIMITED,
      PLAN_FEATURES.PRIORITY_SUPPORT,
      PLAN_FEATURES.CUSTOM_BRANDING,
      PLAN_FEATURES.TEAM_COLLABORATION
    ],
    restrictions: [],
    cta: 'Start Agency',
    popular: false,
    stripe_price_ids: {
      monthly: 'price_1SxSc6LkI17DtQuzVwYMUZjJ',
      yearly: 'price_1SxScuLkI17DtQuzvuL56xT5'
    }
  },

  [USER_TYPES.ENTERPRISE]: {
    id: 'enterprise',
    name: 'Enterprise',
    displayName: 'Enterprise',
    description: 'For large teams and businesses',
    price: {
      monthly: 799,
      yearly: 7990 // 2 months free
    },
    tokens: {
      included: 6000,
      renewal: 'monthly',
      rollover: false
    },
    limits: {
      extensions_per_month: 6000,
      revisions_per_extension: -1, // Unlimited
      storage_mb: -1, // Unlimited
      team_members: -1 // Unlimited
    },
    features: [
      PLAN_FEATURES.EXTENSION_GENERATION,
      PLAN_FEATURES.REVISION_UNLIMITED,
      PLAN_FEATURES.PRIORITY_SUPPORT,
      PLAN_FEATURES.CUSTOM_BRANDING,
      PLAN_FEATURES.TEAM_COLLABORATION,
      PLAN_FEATURES.ADVANCED_ANALYTICS,
      PLAN_FEATURES.API_ACCESS
    ],
    restrictions: [],
    cta: 'Start Enterprise',
    popular: false,
    stripe_price_ids: {
      monthly: 'price_1SxSeWLkI17DtQuzl42dIK3X',
      yearly: 'price_1SxSf8LkI17DtQuzx4nVmb1Y'
    }
  }
}

/**
 * Plan Service Class
 * Handles all plan-related operations, permissions, and upgrades
 */
class PlanService {
  constructor() {
    this.planConfigs = PLAN_CONFIG
  }

  /**
   * Get user's current plan information
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User plan details
   */
  async getUserPlan(userId) {
    try {
      if (!userId) throw new Error('User ID is required')

      // Get token info which includes plan data
      const { data, error } = await tokenApi.getUserTokenInfo(userId)
      
      if (error) {
        debugError('Error fetching user plan:', error)
        throw new Error(error.message)
      }

      const planType = data.plan?.name || USER_TYPES.FREE
      const planConfig = this.planConfigs[planType]

      return {
        success: true,
        plan: {
          type: planType,
          config: planConfig,
          subscription: data.subscription,
          tokens: {
            current: data.current_tokens,
            total_used: data.total_tokens_used,
            reset_date: data.tokens_reset_at
          }
        }
      }

    } catch (error) {
      debugError('PlanService.getUserPlan error:', error)
      return {
        success: false,
        error: error.message,
        plan: null
      }
    }
  }

  /**
   * Check if user can perform a specific action
   * @param {string} userId - User ID
   * @param {string} action - Action to check
   * @param {Object} context - Additional context (e.g., current usage)
   * @returns {Promise<Object>} - Permission result
   */
  async canUserPerformAction(userId, action, context = {}) {
    try {
      const userPlan = await this.getUserPlan(userId)
      
      if (!userPlan.success) {
        return {
          allowed: false,
          reason: 'Unable to determine user plan',
          requiresUpgrade: true
        }
      }

      const { plan } = userPlan
      const planConfig = plan.config

      switch (action) {
        case 'generate_extension':
          return this.checkExtensionGenerationPermission(plan, context)
        
        case 'revise_extension':
          return this.checkRevisionPermission(plan, context)
        
        case 'access_analytics':
          return this.checkFeaturePermission(plan, PLAN_FEATURES.ADVANCED_ANALYTICS)
        
        case 'remove_branding':
          return this.checkFeaturePermission(plan, PLAN_FEATURES.CUSTOM_BRANDING)
        
        case 'team_collaboration':
          return this.checkTeamPermission(plan, context)
        
        case 'api_access':
          return this.checkFeaturePermission(plan, PLAN_FEATURES.API_ACCESS)
        
        default:
          return {
            allowed: false,
            reason: `Unknown action: ${action}`,
            requiresUpgrade: false
          }
      }

    } catch (error) {
      debugError('PlanService.canUserPerformAction error:', error)
      return {
        allowed: false,
        reason: 'Permission check failed',
        requiresUpgrade: false
      }
    }
  }

  /**
   * Check extension generation permission
   * @private
   */
  checkExtensionGenerationPermission(plan, context) {
    const { tokens, config } = plan
    debugLog('🔍 PlanService: checkExtensionGenerationPermission - plan:', plan)
    debugLog('🔍 PlanService: tokens:', tokens)
    debugLog('🔍 PlanService: config:', config)

    // Check token balance for all plans (no longer have unlimited tokens)
    debugLog('🔍 PlanService: Checking token balance - current:', tokens.current)

    if (tokens.current < 1) {
      debugLog('🔍 PlanService: INSUFFICIENT TOKENS - blocking access')
      return {
        allowed: false,
        reason: 'Insufficient tokens',
        requiresUpgrade: config.id === USER_TYPES.FREE,
        tokensNeeded: 1,
        currentTokens: tokens.current
      }
    }

    // Check monthly limits
    const monthlyUsage = context.monthlyUsage || 0
    if (config.limits.extensions_per_month !== -1 && 
        monthlyUsage >= config.limits.extensions_per_month) {
      return {
        allowed: false,
        reason: 'Monthly extension limit reached',
        requiresUpgrade: true,
        limit: config.limits.extensions_per_month,
        current: monthlyUsage
      }
    }

    debugLog('🔍 PlanService: PERMISSION GRANTED - user has sufficient tokens')
    return {
      allowed: true,
      reason: 'Permission granted',
      requiresUpgrade: false
    }
  }

  /**
   * Check revision permission
   * @private
   */
  checkRevisionPermission(plan, context) {
    const { config } = plan
    
    // Unlimited revisions for Pro+ plans
    if (config.features.includes(PLAN_FEATURES.REVISION_UNLIMITED)) {
      return {
        allowed: true,
        reason: 'Unlimited revisions included',
        requiresUpgrade: false
      }
    }

    // Check revision limits for free users
    const revisionCount = context.revisionCount || 0
    const maxRevisions = config.limits.revisions_per_extension

    if (revisionCount >= maxRevisions) {
      return {
        allowed: false,
        reason: `Revision limit reached (${maxRevisions} per extension)`,
        requiresUpgrade: true,
        limit: maxRevisions,
        current: revisionCount
      }
    }

    return {
      allowed: true,
      reason: 'Revision allowed',
      requiresUpgrade: false
    }
  }

  /**
   * Check feature permission
   * @private
   */
  checkFeaturePermission(plan, feature) {
    const hasFeature = plan.config.features.includes(feature)
    
    return {
      allowed: hasFeature,
      reason: hasFeature ? 'Feature included in plan' : 'Feature not available in current plan',
      requiresUpgrade: !hasFeature
    }
  }

  /**
   * Check team collaboration permission
   * @private
   */
  checkTeamPermission(plan, context) {
    const { config } = plan
    const currentMembers = context.teamMembers || 1
    const maxMembers = config.limits.team_members

    if (currentMembers >= maxMembers) {
      return {
        allowed: false,
        reason: `Team member limit reached (${maxMembers})`,
        requiresUpgrade: true,
        limit: maxMembers,
        current: currentMembers
      }
    }

    return {
      allowed: true,
      reason: 'Team collaboration allowed',
      requiresUpgrade: false
    }
  }

  /**
   * Handle plan upgrade
   * @param {string} userId - User ID
   * @param {string} newPlan - New plan type
   * @param {Object} paymentData - Payment information from Stripe
   * @returns {Promise<Object>} - Upgrade result
   */
  async upgradePlan(userId, newPlan, paymentData) {
    try {
      if (!userId || !newPlan) {
        throw new Error('User ID and new plan are required')
      }

      const validPlans = Object.keys(this.planConfigs)
      if (!validPlans.includes(newPlan)) {
        throw new Error(`Invalid plan: ${newPlan}. Valid plans: ${validPlans.join(', ')}`)
      }

      // Get current plan
      const currentPlan = await this.getUserPlan(userId)
      if (!currentPlan.success) {
        throw new Error('Unable to determine current plan')
      }

      // Validate upgrade path
      const upgradeValidation = this.validateUpgradePath(
        currentPlan.plan.type, 
        newPlan
      )

      if (!upgradeValidation.valid) {
        throw new Error(upgradeValidation.reason)
      }

      // Create subscription record
      const planConfig = this.planConfigs[newPlan]
      const subscriptionData = {
        user_id: userId,
        plan_id: await this.getPlanIdFromDatabase(newPlan),
        status: SUBSCRIPTION_STATUS.ACTIVE,
        stripe_subscription_id: paymentData.subscriptionId,
        stripe_customer_id: paymentData.customerId,
        current_period_start: new Date().toISOString(),
        current_period_end: this.calculatePeriodEnd(paymentData.billingCycle),
        cancel_at_period_end: false
      }

      // Insert subscription
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert([subscriptionData])
        .select()
        .single()

      if (subError) {
        debugError('Subscription creation failed:', subError)
        throw new Error('Failed to create subscription')
      }

      // Allocate tokens for new plan
      const tokenAllocation = await this.allocateTokensForPlan(userId, newPlan, subscription.id)
      
      if (!tokenAllocation.success) {
        debugError('Token allocation failed:', tokenAllocation.error)
        // Rollback subscription if token allocation fails
        await supabase.from('user_subscriptions').delete().eq('id', subscription.id)
        throw new Error('Failed to allocate tokens for new plan')
      }

      return {
        success: true,
        subscription,
        tokensAllocated: tokenAllocation.tokensAdded,
        newBalance: tokenAllocation.newBalance,
        message: `Successfully upgraded to ${planConfig.displayName}!`
      }

    } catch (error) {
      debugError('PlanService.upgradePlan error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Validate upgrade path
   * @private
   */
  validateUpgradePath(currentPlan, newPlan) {
    const planHierarchy = {
      [USER_TYPES.FREE]: 0,
      [USER_TYPES.FREELANCER]: 1,
      [USER_TYPES.AGENCY]: 2,
      [USER_TYPES.ENTERPRISE]: 3
    }

    const currentLevel = planHierarchy[currentPlan]
    const newLevel = planHierarchy[newPlan]

    if (currentLevel === undefined || newLevel === undefined) {
      return {
        valid: false,
        reason: 'Invalid plan types'
      }
    }

    if (newLevel <= currentLevel) {
      return {
        valid: false,
        reason: 'Can only upgrade to higher tier plans'
      }
    }

    return {
      valid: true,
      reason: 'Upgrade path valid'
    }
  }

  /**
   * Allocate tokens for monthly plans (cron job function)
   * @param {Array} activeSubscriptions - List of active subscriptions
   * @returns {Promise<Object>} - Allocation results
   */
  async allocateMonthlyTokens(activeSubscriptions = null) {
    try {
      // If no subscriptions provided, fetch all active ones
      if (!activeSubscriptions) {
        activeSubscriptions = await this.getActiveSubscriptions()
      }

      const results = []
      const errors = []

      for (const subscription of activeSubscriptions) {
        try {
          const planConfig = this.planConfigs[subscription.plan_name]
          
          // All plans now have token limits, so process all of them

          // Calculate tokens to allocate (no rollover)
          const tokensToAllocate = await this.calculateMonthlyAllocation(
            subscription.user_id,
            planConfig
          )

          if (tokensToAllocate > 0) {
            const allocationResult = await tokenService.addTokens(
              subscription.user_id,
              tokensToAllocate,
              'reset',
              {
                planName: subscription.plan_name,
                subscriptionId: subscription.id,
                monthlyAllocation: true
              }
            )

            results.push({
              userId: subscription.user_id,
              planName: subscription.plan_name,
              tokensAllocated: tokensToAllocate,
              success: allocationResult.success
            })
          }

        } catch (error) {
          errors.push({
            userId: subscription.user_id,
            error: error.message
          })
        }
      }

      return {
        success: true,
        processed: results.length,
        errors: errors.length,
        results,
        errors
      }

    } catch (error) {
      debugError('PlanService.allocateMonthlyTokens error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Calculate monthly token allocation (no rollover)
   * @private
   */
  async calculateMonthlyAllocation(userId, planConfig) {
    try {
      // Get current token balance
      const tokenInfo = await tokenService.checkTokenBalance(userId)

      if (!tokenInfo.success) {
        throw new Error('Unable to check current balance')
      }

      const currentBalance = tokenInfo.balance.current
      const includedTokens = planConfig.tokens.included

      // Set tokens to included amount (max possible = monthly allocation)
      return includedTokens - currentBalance

    } catch (error) {
      debugError('Error calculating monthly allocation:', error)
      return planConfig.tokens.included
    }
  }

  /**
   * Handle plan expiration
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Expiration handling result
   */
  async handlePlanExpiration(userId) {
    try {
      if (!userId) throw new Error('User ID is required')

      // Get current subscription
      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', SUBSCRIPTION_STATUS.ACTIVE)
        .single()

      if (error) {
        debugLog('No active subscription found for user:', userId)
        return { success: true, action: 'no_subscription' }
      }

      // Check if subscription has expired
      const now = new Date()
      const periodEnd = new Date(subscription.current_period_end)

      if (now <= periodEnd) {
        return { success: true, action: 'not_expired' }
      }

      // Handle expiration based on cancel_at_period_end flag
      if (subscription.cancel_at_period_end) {
        // Cancel subscription and downgrade to free
        await this.downgradeToFree(userId, subscription.id)
        
        return {
          success: true,
          action: 'downgraded_to_free',
          message: 'Subscription expired and user downgraded to free plan'
        }
      } else {
        // Mark as past due - Stripe will handle retry logic
        await supabase
          .from('user_subscriptions')
          .update({ status: SUBSCRIPTION_STATUS.PAST_DUE })
          .eq('id', subscription.id)
        
        return {
          success: true,
          action: 'marked_past_due',
          message: 'Subscription marked as past due'
        }
      }

    } catch (error) {
      debugError('PlanService.handlePlanExpiration error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Downgrade user to free plan
   * @private
   */
  async downgradeToFree(userId, subscriptionId) {
    try {
      // Cancel subscription
      await supabase
        .from('user_subscriptions')
        .update({ status: SUBSCRIPTION_STATUS.CANCELED })
        .eq('id', subscriptionId)

      // Reset tokens to free plan amount (5 tokens)
      const freeConfig = this.planConfigs[USER_TYPES.FREE]
      
      // Get current balance to calculate adjustment
      const tokenInfo = await tokenService.checkTokenBalance(userId)
      if (tokenInfo.success) {
        const currentBalance = tokenInfo.balance.current
        const targetBalance = freeConfig.tokens.included
        
        // If user has more tokens than free limit, don't reduce them immediately
        // Let them use existing tokens but don't add more
        if (currentBalance < targetBalance) {
          await tokenService.addTokens(
            userId,
            targetBalance - currentBalance,
            'reset',
            { planName: 'free', reason: 'downgrade' }
          )
        }
      }

      return { success: true }

    } catch (error) {
      debugError('Downgrade to free failed:', error)
      throw error
    }
  }

  /**
   * Get all plan configurations
   * @returns {Object} - All plan configurations
   */
  getAllPlans() {
    return this.planConfigs
  }

  /**
   * Get specific plan configuration
   * @param {string} planType - Plan type
   * @returns {Object} - Plan configuration
   */
  getPlanConfig(planType) {
    return this.planConfigs[planType] || null
  }

  /**
   * Helper methods
   */
  async getPlanIdFromDatabase(planName) {
    const { data, error } = await supabase
      .from('plans')
      .select('id')
      .eq('name', planName)
      .single()
    
    if (error) throw error
    return data.id
  }

  calculatePeriodEnd(billingCycle = 'monthly') {
    const now = new Date()
    if (billingCycle === 'yearly') {
      now.setFullYear(now.getFullYear() + 1)
    } else {
      now.setMonth(now.getMonth() + 1)
    }
    return now.toISOString()
  }

  async getActiveSubscriptions() {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plans (name)
      `)
      .eq('status', SUBSCRIPTION_STATUS.ACTIVE)
    
    if (error) throw error
    
    return data.map(sub => ({
      ...sub,
      plan_name: sub.plans.name
    }))
  }

  async allocateTokensForPlan(userId, planType, subscriptionId) {
    const planConfig = this.planConfigs[planType]
    
    // All plans now require token allocation

    return await tokenService.addTokens(
      userId,
      planConfig.tokens.included,
      'purchase',
      {
        planName: planType,
        subscriptionId,
        initialAllocation: true
      }
    )
  }
}

// Export singleton instance
export const planService = new PlanService()
export default planService