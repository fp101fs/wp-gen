/**
 * TokenService Usage Examples
 * These examples show how to integrate the TokenService into your application
 */

import { tokenService } from './TokenService'

/**
 * Example 1: Extension Generation with Token Deduction
 * Use this pattern in your generateExtension function
 */
export const handleExtensionGeneration = async (userId, extensionData) => {
  try {
    // Step 1: Validate user can perform the operation
    const validation = await tokenService.validateTokenOperation(userId, 1)
    
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        showUpgradePrompt: true
      }
    }

    if (!validation.canPerform && !validation.unlimited) {
      return {
        success: false,
        error: validation.message,
        tokensNeeded: validation.tokensRequired,
        tokensAvailable: validation.tokensAvailable,
        showUpgradePrompt: true
      }
    }

    // Step 2: Generate the extension (your existing AI logic)
    const extension = await generateExtensionWithAI(extensionData)
    
    if (!extension.success) {
      return {
        success: false,
        error: 'Extension generation failed',
        showUpgradePrompt: false
      }
    }

    // Step 3: Deduct token only after successful generation
    const deduction = await tokenService.deductToken(
      userId,
      1,
      `Generated extension: ${extension.name}`,
      extension.id
    )

    if (!deduction.success) {
      console.error('Token deduction failed after generation:', deduction.error)
      // Extension was created but token not deducted - log for manual review
    }

    return {
      success: true,
      extension: extension,
      tokensRemaining: deduction.tokensRemaining,
      unlimited: deduction.unlimited,
      message: `Extension generated successfully! ${deduction.unlimited ? 'Unlimited plan' : `${deduction.tokensRemaining} tokens remaining`}`
    }

  } catch (error) {
    console.error('Extension generation error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
      showUpgradePrompt: false
    }
  }
}

/**
 * Example 2: Token Purchase Processing
 * Use this after successful Stripe payment
 */
export const handleTokenPurchase = async (userId, planData, paymentData) => {
  try {
    const metadata = {
      planName: planData.name,
      paymentIntentId: paymentData.payment_intent_id,
      subscriptionId: paymentData.subscription_id,
      stripePriceId: planData.stripe_price_id
    }

    const result = await tokenService.addTokens(
      userId,
      planData.tokens_per_month,
      'purchase',
      metadata
    )

    if (!result.success) {
      console.error('Token purchase processing failed:', result.error)
      return {
        success: false,
        error: 'Failed to add tokens to account'
      }
    }

    return {
      success: true,
      tokensAdded: result.tokensAdded,
      newBalance: result.newBalance,
      transactionId: result.transactionId,
      message: `Successfully added ${result.tokensAdded} tokens to your account!`
    }

  } catch (error) {
    console.error('Token purchase error:', error)
    return {
      success: false,
      error: 'Purchase processing failed'
    }
  }
}

/**
 * Example 3: User Dashboard Data
 * Get all user information for dashboard display
 */
export const getUserDashboardData = async (userId) => {
  try {
    // Get plan details (includes balance, subscription, permissions)
    const planDetails = await tokenService.getUserPlanDetails(userId)
    
    if (!planDetails.success) {
      return {
        success: false,
        error: planDetails.error
      }
    }

    // Get recent transaction history
    const history = await tokenService.getTokenHistory(userId, 10)
    
    return {
      success: true,
      user: {
        plan: planDetails.plan,
        subscription: planDetails.subscription,
        permissions: planDetails.permissions,
        usage: planDetails.usage
      },
      recentTransactions: history.success ? history.transactions : [],
      canGenerate: planDetails.permissions.canGenerate,
      shouldShowUpgrade: !planDetails.permissions.hasSubscription && planDetails.plan.name === 'free'
    }

  } catch (error) {
    console.error('Dashboard data error:', error)
    return {
      success: false,
      error: 'Failed to load dashboard data'
    }
  }
}

/**
 * Example 4: Before Extension Generation Check
 * Use this to show appropriate UI before generation
 */
export const checkGenerationAllowance = async (userId) => {
  try {
    const validation = await tokenService.validateTokenOperation(userId, 1)
    
    return {
      canGenerate: validation.canPerform || validation.unlimited,
      unlimited: validation.unlimited,
      tokensAvailable: validation.tokensAvailable,
      message: validation.message,
      showUpgradePrompt: !validation.canPerform && !validation.unlimited
    }

  } catch (error) {
    console.error('Generation allowance check error:', error)
    return {
      canGenerate: false,
      unlimited: false,
      tokensAvailable: 0,
      message: 'Unable to check token status',
      showUpgradePrompt: true
    }
  }
}

/**
 * Example 5: Monthly Token Allocation (Admin/Cron Job)
 * Run this monthly to reset tokens for subscribed users
 */
export const processMonthlyTokenAllocations = async () => {
  try {
    // This would typically get data from your subscriptions table
    // For demo purposes, here's the structure:
    const activeSubscriptions = await getActiveSubscriptions() // Your implementation
    
    const userUpdates = activeSubscriptions.map(sub => ({
      userId: sub.user_id,
      tokenAmount: sub.plan.tokens_per_month,
      planName: sub.plan.name
    }))

    const result = await tokenService.bulkTokenReset(userUpdates)
    
    console.log(`Monthly allocation processed: ${result.processed} users, ${result.errors} errors`)
    
    return result

  } catch (error) {
    console.error('Monthly allocation error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Example 6: Error Handling Patterns
 * Consistent error handling across your app
 */
export const handleTokenServiceError = (error, operation = 'token operation') => {
  const errorPatterns = {
    'Rate limit exceeded': {
      userMessage: 'Too many requests. Please wait a moment and try again.',
      action: 'retry',
      retryAfter: 60000 // 1 minute
    },
    'Insufficient tokens': {
      userMessage: 'You don\'t have enough tokens to perform this action.',
      action: 'upgrade',
      showUpgradePrompt: true
    },
    'User not authenticated': {
      userMessage: 'Please log in to continue.',
      action: 'login',
      redirectToLogin: true
    },
    'Authentication validation failed': {
      userMessage: 'Session expired. Please log in again.',
      action: 'login',
      redirectToLogin: true
    }
  }

  // Find matching error pattern
  const pattern = Object.keys(errorPatterns).find(key => 
    error.includes(key)
  )

  if (pattern) {
    return {
      type: 'known_error',
      pattern,
      ...errorPatterns[pattern],
      originalError: error
    }
  }

  // Unknown error - generic handling
  return {
    type: 'unknown_error',
    userMessage: `Something went wrong with ${operation}. Please try again.`,
    action: 'retry',
    originalError: error
  }
}

/**
 * Example 7: React Hook Integration
 * How to use TokenService with your existing useTokens hook
 */
export const enhanceTokenHook = () => {
  // In your useTokens hook, replace direct API calls with TokenService calls:
  
  const deductTokensEnhanced = async (amount, description, extensionId) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    // Use TokenService instead of direct API call
    const result = await tokenService.deductToken(user.id, amount, description, extensionId)
    
    if (!result.success) {
      const errorInfo = handleTokenServiceError(result.error, 'token deduction')
      setError(errorInfo.userMessage)
      
      if (errorInfo.showUpgradePrompt) {
        // Show upgrade prompt in UI
        setShowUpgradePrompt(true)
      }
      
      throw new Error(errorInfo.userMessage)
    }

    // Refresh token info after successful deduction
    await fetchTokenInfo()
    return result
  }

  return { deductTokensEnhanced }
}

// Placeholder function - implement based on your subscription system
async function getActiveSubscriptions() {
  // This should query your user_subscriptions table for active subscriptions
  // Return format: [{ user_id, plan: { tokens_per_month, name } }]
  return []
}

// Placeholder function - implement based on your AI generation logic
async function generateExtensionWithAI(extensionData) {
  // Your existing extension generation logic
  return { success: true, name: 'Test Extension', id: 'ext_123' }
}