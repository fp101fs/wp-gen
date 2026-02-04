/**
 * PlanService Usage Examples
 * Practical examples for integrating plan management into your app
 */

import { planService, USER_TYPES, PLAN_FEATURES } from './PlanService'

/**
 * Example 1: Check if user can generate extension
 * Use this before showing the generation form
 */
export const checkExtensionGenerationPermission = async (userId) => {
  try {
    // Check basic permission
    const permission = await planService.canUserPerformAction(
      userId, 
      'generate_extension',
      { monthlyUsage: 0 } // You'd get this from your analytics
    )

    if (!permission.allowed) {
      return {
        canGenerate: false,
        reason: permission.reason,
        requiresUpgrade: permission.requiresUpgrade,
        upgradeMessage: getUpgradeMessage(permission),
        currentTokens: permission.currentTokens || 0
      }
    }

    return {
      canGenerate: true,
      reason: permission.reason,
      requiresUpgrade: false
    }

  } catch (error) {
    console.error('Permission check failed:', error)
    return {
      canGenerate: false,
      reason: 'Unable to check permissions',
      requiresUpgrade: true
    }
  }
}

/**
 * Example 2: Display user's plan information in UI
 * Perfect for dashboard or profile pages
 */
export const getUserPlanDisplay = async (userId) => {
  try {
    const userPlan = await planService.getUserPlan(userId)
    
    if (!userPlan.success) {
      return {
        success: false,
        error: userPlan.error
      }
    }

    const { plan } = userPlan
    const config = plan.config

    return {
      success: true,
      display: {
        planName: config.displayName,
        planType: plan.type,
        monthlyPrice: config.price.monthly,
        yearlyPrice: config.price.yearly,
        tokensIncluded: config.tokens.included === -1 ? 'Unlimited' : config.tokens.included,
        tokensRemaining: plan.tokens.current === -1 ? 'Unlimited' : plan.tokens.current,
        tokensUsed: plan.tokens.total_used,
        resetDate: plan.tokens.reset_date,
        features: config.features.map(feature => getFeatureDisplayName(feature)),
        restrictions: config.restrictions,
        isUnlimited: config.tokens.included === -1,
        subscriptionStatus: plan.subscription?.status || 'none',
        subscriptionEnds: plan.subscription?.current_period_end || null,
        canUpgrade: plan.type !== USER_TYPES.UNLIMITED
      }
    }

  } catch (error) {
    console.error('Get plan display failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Example 3: Handle plan upgrade flow
 * Use this after successful Stripe payment
 */
export const processUpgrade = async (userId, newPlanType, stripeData) => {
  try {
    // Validate upgrade
    const currentPlan = await planService.getUserPlan(userId)
    if (!currentPlan.success) {
      throw new Error('Unable to determine current plan')
    }

    // Process upgrade
    const upgradeResult = await planService.upgradePlan(userId, newPlanType, {
      subscriptionId: stripeData.subscription.id,
      customerId: stripeData.customer.id,
      billingCycle: stripeData.billing_cycle || 'monthly'
    })

    if (!upgradeResult.success) {
      return {
        success: false,
        error: upgradeResult.error,
        showSupport: true
      }
    }

    // Get new plan config for display
    const newPlanConfig = planService.getPlanConfig(newPlanType)

    return {
      success: true,
      upgrade: {
        fromPlan: currentPlan.plan.config.displayName,
        toPlan: newPlanConfig.displayName,
        tokensAdded: upgradeResult.tokensAllocated,
        newTokenBalance: upgradeResult.newBalance,
        subscriptionId: upgradeResult.subscription.id,
        message: upgradeResult.message
      },
      nextSteps: [
        `You now have ${upgradeResult.newBalance === -1 ? 'unlimited' : upgradeResult.newBalance} tokens`,
        'Start creating extensions with your new plan',
        newPlanConfig.features.includes(PLAN_FEATURES.PRIORITY_SUPPORT) ? 'Contact support for priority assistance' : null
      ].filter(Boolean)
    }

  } catch (error) {
    console.error('Upgrade processing failed:', error)
    return {
      success: false,
      error: error.message,
      showSupport: true
    }
  }
}

/**
 * Example 4: Feature availability check
 * Use this to show/hide features in your UI
 */
export const checkFeatureAvailability = async (userId, features) => {
  try {
    const userPlan = await planService.getUserPlan(userId)
    
    if (!userPlan.success) {
      return {
        success: false,
        error: userPlan.error
      }
    }

    const availableFeatures = {}
    const unavailableFeatures = {}

    for (const feature of features) {
      const permission = await planService.canUserPerformAction(userId, getActionForFeature(feature))
      
      if (permission.allowed) {
        availableFeatures[feature] = {
          available: true,
          reason: permission.reason
        }
      } else {
        unavailableFeatures[feature] = {
          available: false,
          reason: permission.reason,
          requiresUpgrade: permission.requiresUpgrade
        }
      }
    }

    return {
      success: true,
      available: availableFeatures,
      unavailable: unavailableFeatures,
      planType: userPlan.plan.type
    }

  } catch (error) {
    console.error('Feature availability check failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Example 5: Upgrade recommendations
 * Show users what they get by upgrading
 */
export const getUpgradeRecommendations = async (userId) => {
  try {
    const userPlan = await planService.getUserPlan(userId)
    
    if (!userPlan.success) {
      return {
        success: false,
        error: userPlan.error
      }
    }

    const currentPlanType = userPlan.plan.type
    const allPlans = planService.getAllPlans()
    const recommendations = []

    // Generate recommendations for higher tiers
    Object.values(allPlans).forEach(planConfig => {
      if (shouldRecommendPlan(currentPlanType, planConfig.id)) {
        const benefits = calculateUpgradeBenefits(currentPlanType, planConfig.id)
        
        recommendations.push({
          planType: planConfig.id,
          planName: planConfig.displayName,
          monthlyPrice: planConfig.price.monthly,
          yearlyPrice: planConfig.price.yearly,
          savings: planConfig.price.monthly > 0 ? Math.round((planConfig.price.monthly * 12 - planConfig.price.yearly) * 100 / (planConfig.price.monthly * 12)) : 0,
          benefits,
          cta: planConfig.cta,
          popular: planConfig.popular,
          features: planConfig.features.map(feature => getFeatureDisplayName(feature))
        })
      }
    })

    return {
      success: true,
      currentPlan: userPlan.plan.config.displayName,
      recommendations: recommendations.sort((a, b) => a.monthlyPrice - b.monthlyPrice)
    }

  } catch (error) {
    console.error('Upgrade recommendations failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Example 6: Usage analytics for plan optimization
 * Help users understand if they need to upgrade/downgrade
 */
export const getUsageAnalytics = async (userId, period = 30) => {
  try {
    const userPlan = await planService.getUserPlan(userId)
    
    if (!userPlan.success) {
      return {
        success: false,
        error: userPlan.error
      }
    }

    // Get token history for analysis
    const tokenHistory = await tokenService.getTokenHistory(userId, 100)
    
    if (!tokenHistory.success) {
      return {
        success: false,
        error: 'Unable to fetch usage history'
      }
    }

    const analytics = analyzeTokenUsage(tokenHistory.transactions, period)
    const recommendations = generateUsageRecommendations(userPlan.plan, analytics)

    return {
      success: true,
      period: `${period} days`,
      usage: {
        totalTokensUsed: analytics.totalUsed,
        dailyAverage: analytics.dailyAverage,
        peakUsageDay: analytics.peakDay,
        extensionsGenerated: analytics.extensionCount,
        revisionsCreated: analytics.revisionCount
      },
      efficiency: {
        tokensPerExtension: analytics.tokensPerExtension,
        utilizationRate: analytics.utilizationRate,
        projectedMonthlyUsage: analytics.projectedMonthly
      },
      recommendations
    }

  } catch (error) {
    console.error('Usage analytics failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Example 7: Plan expiration handler (for cron jobs)
 * Run this daily to handle expired subscriptions
 */
export const handleExpiredSubscriptions = async () => {
  try {
    // Get all active subscriptions
    const { data: subscriptions, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('status', 'active')
      .lte('current_period_end', new Date().toISOString())

    if (error) throw error

    const results = []
    const errors = []

    for (const subscription of subscriptions) {
      try {
        const result = await planService.handlePlanExpiration(subscription.user_id)
        
        results.push({
          userId: subscription.user_id,
          action: result.action,
          success: result.success
        })

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
    console.error('Expiration handling failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Helper Functions
 */

function getUpgradeMessage(permission) {
  if (permission.reason === 'Insufficient tokens') {
    return `You need ${permission.tokensNeeded} token${permission.tokensNeeded > 1 ? 's' : ''} but only have ${permission.currentTokens}. Upgrade to get more tokens!`
  }
  
  if (permission.reason === 'Monthly extension limit reached') {
    return `You've reached your monthly limit of ${permission.limit} extensions. Upgrade for more!`
  }
  
  return 'Upgrade your plan to access this feature!'
}

function getFeatureDisplayName(feature) {
  const featureNames = {
    [PLAN_FEATURES.EXTENSION_GENERATION]: 'Extension Generation',
    [PLAN_FEATURES.REVISION_UNLIMITED]: 'Unlimited Revisions',
    [PLAN_FEATURES.PRIORITY_SUPPORT]: 'Priority Support',
    [PLAN_FEATURES.CUSTOM_BRANDING]: 'Custom Branding',
    [PLAN_FEATURES.TEAM_COLLABORATION]: 'Team Collaboration',
    [PLAN_FEATURES.ADVANCED_ANALYTICS]: 'Advanced Analytics',
    [PLAN_FEATURES.API_ACCESS]: 'API Access'
  }
  
  return featureNames[feature] || feature
}

function getActionForFeature(feature) {
  const actionMap = {
    'analytics': 'access_analytics',
    'branding': 'remove_branding',
    'team': 'team_collaboration',
    'api': 'api_access'
  }
  
  return actionMap[feature] || feature
}

function shouldRecommendPlan(currentPlan, targetPlan) {
  const hierarchy = {
    [USER_TYPES.FREE]: 0,
    [USER_TYPES.PRO]: 1,
    [USER_TYPES.UNLIMITED]: 2
  }
  
  return hierarchy[targetPlan] > hierarchy[currentPlan]
}

function calculateUpgradeBenefits(currentPlan, targetPlan) {
  const current = planService.getPlanConfig(currentPlan)
  const target = planService.getPlanConfig(targetPlan)
  
  const benefits = []
  
  // Token benefits
  if (target.tokens.included === -1) {
    benefits.push('Unlimited tokens')
  } else if (target.tokens.included > current.tokens.included) {
    benefits.push(`${target.tokens.included - current.tokens.included} more tokens per month`)
  }
  
  // Feature benefits
  const newFeatures = target.features.filter(f => !current.features.includes(f))
  benefits.push(...newFeatures.map(f => getFeatureDisplayName(f)))
  
  return benefits
}

function analyzeTokenUsage(transactions, period) {
  const periodStart = new Date()
  periodStart.setDate(periodStart.getDate() - period)
  
  const relevantTransactions = transactions.filter(t => 
    new Date(t.created_at) >= periodStart && t.amount < 0
  )
  
  const totalUsed = relevantTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const dailyAverage = totalUsed / period
  const extensionCount = relevantTransactions.filter(t => 
    t.description.includes('extension') || t.description.includes('generation')
  ).length
  
  return {
    totalUsed,
    dailyAverage,
    extensionCount,
    tokensPerExtension: extensionCount > 0 ? totalUsed / extensionCount : 0,
    projectedMonthly: dailyAverage * 30
  }
}

function generateUsageRecommendations(currentPlan, analytics) {
  const recommendations = []
  
  if (currentPlan.type === USER_TYPES.FREE) {
    if (analytics.projectedMonthly > 5) {
      recommendations.push({
        type: 'upgrade',
        message: 'Consider upgrading to Pro for more tokens',
        reason: `You're projected to need ${Math.ceil(analytics.projectedMonthly)} tokens monthly`
      })
    }
  }
  
  if (currentPlan.type === USER_TYPES.PRO) {
    if (analytics.projectedMonthly > 150) { // 2x Pro allocation
      recommendations.push({
        type: 'upgrade',
        message: 'Consider Unlimited plan for heavy usage',
        reason: 'Your usage exceeds typical Pro plan limits'
      })
    }
  }
  
  return recommendations
}

export default {
  checkExtensionGenerationPermission,
  getUserPlanDisplay,
  processUpgrade,
  checkFeatureAvailability,
  getUpgradeRecommendations,
  getUsageAnalytics,
  handleExpiredSubscriptions
}