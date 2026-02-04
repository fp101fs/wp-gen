import { supabase, tokenApi, handleSupabaseError } from '../supabaseClient'
import { debugLog, debugError } from '../utils/debugUtils'

/**
 * Comprehensive Token Management Service
 * Handles all token operations with atomic transactions, validation, and audit logging
 */
class TokenService {
  constructor() {
    this.rateLimitCache = new Map() // Simple in-memory rate limiting
    this.maxRequestsPerMinute = 60
    this.profileCreationCache = new Map() // Prevent simultaneous profile creations
  }

  /**
   * Rate limiting check to prevent abuse
   * @param {string} userId - User ID to check
   * @param {string} operation - Operation type for logging
   * @returns {boolean} - Whether operation is allowed
   */
  checkRateLimit(userId, operation) {
    const key = `${userId}:${operation}`
    const now = Date.now()
    const windowStart = now - 60000 // 1 minute window

    // Get or create rate limit data for this user/operation
    if (!this.rateLimitCache.has(key)) {
      this.rateLimitCache.set(key, [])
    }

    const requests = this.rateLimitCache.get(key)
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart)
    
    // Check if under limit
    if (validRequests.length >= this.maxRequestsPerMinute) {
      console.warn(`Rate limit exceeded for user ${userId} operation ${operation}`)
      return false
    }

    // Add current request and update cache
    validRequests.push(now)
    this.rateLimitCache.set(key, validRequests)
    
    return true
  }

  /**
   * Validate user authentication
   * @param {string} userId - User ID to validate
   * @returns {Promise<boolean>} - Whether user is authenticated
   */
  async validateUser(userId) {
    if (!userId) {
      throw new Error('User ID is required')
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      
      if (!user || user.id !== userId) {
        throw new Error('User not authenticated or ID mismatch')
      }
      
      return true
    } catch (error) {
      debugError('User validation failed:', error)
      throw new Error('Authentication validation failed')
    }
  }

  /**
   * Safely deduct tokens with comprehensive validation
   * @param {string} userId - User ID
   * @param {number} amount - Number of tokens to deduct
   * @param {string} description - Description of the operation
   * @param {string} extensionId - Optional extension ID for tracking
   * @returns {Promise<Object>} - Deduction result
   */
  async deductToken(userId, amount = 1, description = 'Extension generation', extensionId = null) {
    try {
      // Input validation
      if (!userId) throw new Error('User ID is required')
      if (!amount || amount < 1) throw new Error('Token amount must be at least 1')
      if (typeof amount !== 'number' || !Number.isInteger(amount)) {
        throw new Error('Token amount must be a positive integer')
      }

      // Rate limiting
      if (!this.checkRateLimit(userId, 'deduct')) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      // User validation
      await this.validateUser(userId)

      // Use database function for atomic operation
      const { data, error } = await tokenApi.deductTokens(userId, amount, description, extensionId)
      
      if (error) {
        debugError('Token deduction failed:', error)
        throw new Error(error.message || 'Failed to deduct tokens')
      }

      // Log successful operation
      debugLog(`Token deduction successful for user ${userId}:`, data)
      
      return {
        success: data.success,
        tokensRemaining: data.tokens_remaining,
        unlimited: data.unlimited,
        transactionId: data.transaction_id,
        message: data.success 
          ? `Successfully deducted ${amount} token${amount > 1 ? 's' : ''}` 
          : data.error
      }

    } catch (error) {
      debugError('TokenService.deductToken error:', error)
      
      // Return structured error response
      return {
        success: false,
        error: error.message,
        tokensRemaining: 0,
        unlimited: false,
        message: error.message
      }
    }
  }

  /**
   * Get current token balance and user info
   * @param {string} userId - User ID
   * @param {number} retryCount - Internal retry counter for recursive calls
   * @returns {Promise<Object>} - Token balance information
   */
  async checkTokenBalance(userId, retryCount = 0) {
    try {
      if (!userId) throw new Error('User ID is required')

      // Rate limiting
      if (!this.checkRateLimit(userId, 'balance')) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      // User validation
      await this.validateUser(userId)

      const { data, error } = await tokenApi.getUserTokenInfo(userId)
      
      if (error) {
        debugLog('🔍 TokenService: Error details:', { 
          message: error.message, 
          code: error.code,
          details: error.details 
        });
        
        // If user profile doesn't exist, try to create it
        if (error.message?.includes('No user profile found') || 
            error.message?.includes('not found') ||
            error.message?.includes('null') ||
            error.code === 'PGRST116') {
          debugLog('🔧 TokenService: User profile not found, creating default profile for:', userId)
          await this.createDefaultUserProfile(userId)
          
          // Retry getting token info after profile creation
          const retryResult = await tokenApi.getUserTokenInfo(userId)
          if (retryResult.error) {
            debugError('🔍 TokenService: Token balance check failed after profile creation:', retryResult.error)
            throw new Error(retryResult.error.message || 'Failed to check token balance')
          }
          return this.formatTokenBalanceResponse(retryResult.data)
        }
        
        debugError('🔍 TokenService: Token balance check failed:', error)
        throw new Error(error.message || 'Failed to check token balance')
      }

      // Also check if we got default/empty data (meaning no profile exists)
      if (!data || (data.current_tokens === 0 && data.total_tokens_used === 0 && !data.subscription)) {
        debugLog('🔧 TokenService: Got default/empty data, checking if profile exists for:', userId)
        
        // Check if profile actually exists, with proper error handling
        const { data: profileCheck, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, current_tokens, total_tokens_used')
          .eq('id', userId)
          .single();
          
        // Only create profile if we get a clear "not found" error, not permission errors
        if (profileError && profileError.code === 'PGRST116' && !profileCheck) {
          debugLog('🔧 TokenService: No profile found (confirmed), creating default profile for:', userId)
          
          // Check if profile creation is already in progress for this user
          if (this.profileCreationCache.has(userId)) {
            debugLog('⏳ TokenService: Profile creation already in progress for:', userId)
            // Wait for the existing creation to complete
            await this.profileCreationCache.get(userId)
            // Retry the balance check after waiting
            if (retryCount < 2) {
              debugLog('🔄 TokenService: Retrying balance check after waiting for profile creation...')
              await new Promise(resolve => setTimeout(resolve, 500))
              return await this.checkTokenBalance(userId, retryCount + 1)
            }
            return this.formatTokenBalanceResponse({ current_tokens: 3, total_tokens_used: 0, plan: { name: 'free', is_unlimited: false } })
          }
          
          // Create a promise to track profile creation
          const creationPromise = this.createDefaultUserProfile(userId)
          this.profileCreationCache.set(userId, creationPromise)
          
          try {
            await creationPromise
            
            // Try to create subscription, but don't fail if it errors
            try {
              const { data: freeplan } = await supabase
                .from('plans')
                .select('id')
                .eq('name', 'free')
                .single();
                
              if (freeplan) {
                await supabase
                  .from('user_subscriptions')
                  .insert({
                    user_id: userId,
                    plan_id: freeplan.id,
                    status: 'active',
                    cancel_at_period_end: false
                  });
              }
            } catch (subscriptionError) {
              debugLog('⚠️ TokenService: Could not create subscription (may already exist):', subscriptionError.message)
            }
            
            debugLog('✅ TokenService: Created profile and subscription for:', userId)
            
            // Wait a bit for the profile to be fully created, then retry the entire balance check
            if (retryCount < 2) {
              debugLog('🔄 TokenService: Retrying balance check after profile creation...')
              await new Promise(resolve => setTimeout(resolve, 1000))
              return await this.checkTokenBalance(userId, retryCount + 1)
            }
          } catch (createError) {
            debugLog('⚠️ TokenService: Profile creation failed, may already exist:', createError.message)
          } finally {
            // Clean up the cache entry
            this.profileCreationCache.delete(userId)
          }
        } else if (profileCheck) {
          // Profile exists, use that data (regardless of current token count)
          debugLog('🔧 TokenService: Found existing profile with tokens:', profileCheck.current_tokens)
          return this.formatTokenBalanceResponse({
            current_tokens: profileCheck.current_tokens,
            total_tokens_used: profileCheck.total_tokens_used,
            plan: { name: 'free', is_unlimited: false }
          })
        } else if (profileError && profileError.code !== 'PGRST116') {
          // Database permission or other error - don't create profile
          debugLog('⚠️ TokenService: Database permission error, skipping profile creation:', profileError.message)
        }
      }

      return this.formatTokenBalanceResponse(data)

    } catch (error) {
      debugError('TokenService.checkTokenBalance error:', error)
      return {
        success: false,
        error: error.message,
        balance: null
      }
    }
  }

  /**
   * Add tokens to user account (purchases, bonuses, refunds)
   * @param {string} userId - User ID
   * @param {number} amount - Number of tokens to add
   * @param {string} source - Source of tokens ('purchase', 'bonus', 'refund')
   * @param {Object} metadata - Additional data (payment info, etc.)
   * @returns {Promise<Object>} - Addition result
   */
  async addTokens(userId, amount, source = 'purchase', metadata = {}) {
    try {
      // Input validation
      if (!userId) throw new Error('User ID is required')
      if (!amount || amount < 1) throw new Error('Token amount must be at least 1')
      if (typeof amount !== 'number' || !Number.isInteger(amount)) {
        throw new Error('Token amount must be a positive integer')
      }

      const validSources = ['purchase', 'bonus', 'refund', 'reset']
      if (!validSources.includes(source)) {
        throw new Error(`Invalid token source. Must be one of: ${validSources.join(', ')}`)
      }

      // Rate limiting
      if (!this.checkRateLimit(userId, 'add')) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      // User validation (skip for system operations like 'reset')
      if (source !== 'reset') {
        await this.validateUser(userId)
      }

      // Prepare description with metadata
      const description = this.formatTokenDescription(source, amount, metadata)
      
      const { data, error } = await tokenApi.addTokens(
        userId, 
        amount, 
        source, 
        description,
        metadata.subscriptionId || null
      )
      
      if (error) {
        debugError('Token addition failed:', error)
        throw new Error(error.message || 'Failed to add tokens')
      }

      // Log successful operation
      debugLog(`Token addition successful for user ${userId}:`, data)
      
      return {
        success: data.success,
        tokensAdded: data.tokens_added,
        newBalance: data.new_balance,
        transactionId: data.transaction_id,
        message: `Successfully added ${amount} token${amount > 1 ? 's' : ''} from ${source}`
      }

    } catch (error) {
      debugError('TokenService.addTokens error:', error)
      return {
        success: false,
        error: error.message,
        tokensAdded: 0,
        newBalance: 0,
        message: error.message
      }
    }
  }

  /**
   * Get token transaction history
   * @param {string} userId - User ID
   * @param {number} limit - Number of transactions to retrieve
   * @returns {Promise<Object>} - Transaction history
   */
  async getTokenHistory(userId, limit = 50) {
    try {
      if (!userId) throw new Error('User ID is required')
      if (limit > 200) limit = 200 // Cap at 200 for performance

      // Rate limiting
      if (!this.checkRateLimit(userId, 'history')) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      // User validation
      await this.validateUser(userId)

      const { data, error } = await tokenApi.getTokenHistory(userId, limit)
      
      if (error) {
        debugError('Token history fetch failed:', error)
        throw new Error(error.message || 'Failed to fetch token history')
      }

      // Format transactions for better UX
      const formattedTransactions = data.map(transaction => ({
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.transaction_type,
        description: transaction.description,
        balanceAfter: transaction.balance_after,
        date: new Date(transaction.created_at),
        extensionId: transaction.extension_id,
        metadata: transaction.metadata,
        isDeduction: transaction.amount < 0,
        isAddition: transaction.amount > 0
      }))

      return {
        success: true,
        transactions: formattedTransactions,
        totalCount: data.length
      }

    } catch (error) {
      debugError('TokenService.getTokenHistory error:', error)
      return {
        success: false,
        error: error.message,
        transactions: []
      }
    }
  }

  /**
   * Validate if user can perform a token operation
   * @param {string} userId - User ID
   * @param {number} requiredTokens - Number of tokens required
   * @returns {Promise<Object>} - Validation result
   */
  async validateTokenOperation(userId, requiredTokens = 1) {
    try {
      if (!userId) throw new Error('User ID is required')
      if (requiredTokens < 1) throw new Error('Required tokens must be at least 1')

      const balanceResult = await this.checkTokenBalance(userId)
      
      if (!balanceResult.success) {
        return balanceResult
      }

      const { balance, plan } = balanceResult
      
      // Unlimited users can always perform operations
      if (balance.isUnlimited) {
        return {
          success: true,
          canPerform: true,
          unlimited: true,
          message: 'Operation allowed (unlimited plan)'
        }
      }

      // Check if user has enough tokens
      const canPerform = balance.current >= requiredTokens
      
      return {
        success: true,
        canPerform,
        unlimited: false,
        tokensAvailable: balance.current,
        tokensRequired: requiredTokens,
        tokensShort: canPerform ? 0 : requiredTokens - balance.current,
        message: canPerform 
          ? 'Operation allowed' 
          : `Insufficient tokens. Need ${requiredTokens}, have ${balance.current}`
      }

    } catch (error) {
      debugError('TokenService.validateTokenOperation error:', error)
      return {
        success: false,
        error: error.message,
        canPerform: false
      }
    }
  }

  /**
   * Get user's plan details and permissions
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Plan details
   */
  async getUserPlanDetails(userId) {
    try {
      if (!userId) throw new Error('User ID is required')

      // Rate limiting
      if (!this.checkRateLimit(userId, 'plan')) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      const balanceResult = await this.checkTokenBalance(userId)
      
      if (!balanceResult.success) {
        return balanceResult
      }

      const { plan, subscription, balance } = balanceResult
      
      return {
        success: true,
        plan: {
          name: plan.name,
          tokensPerMonth: plan.tokens_per_month,
          isUnlimited: plan.is_unlimited,
          price: plan.price_cents ? plan.price_cents / 100 : 0
        },
        subscription: subscription ? {
          status: subscription.status,
          periodEnd: subscription.current_period_end,
          active: subscription.status === 'active'
        } : null,
        permissions: {
          canGenerate: balance.isUnlimited || balance.current > 0,
          canUpgrade: plan.name === 'free' || plan.name === 'pro',
          hasSubscription: !!subscription
        },
        usage: {
          currentTokens: balance.current,
          totalUsed: balance.totalUsed,
          resetDate: balance.resetDate
        }
      }

    } catch (error) {
      debugError('TokenService.getUserPlanDetails error:', error)
      return {
        success: false,
        error: error.message,
        plan: null
      }
    }
  }

  /**
   * Format token transaction descriptions
   * @private
   */
  formatTokenDescription(source, amount, metadata) {
    const descriptions = {
      purchase: `Purchased ${amount} tokens`,
      bonus: `Bonus ${amount} tokens`,
      refund: `Refund of ${amount} tokens`,
      reset: `Monthly token reset: ${amount} tokens`
    }

    let description = descriptions[source] || `${source}: ${amount} tokens`

    // Add metadata context
    if (metadata.planName) {
      description += ` (${metadata.planName} plan)`
    }
    if (metadata.paymentIntentId) {
      description += ` - Payment: ${metadata.paymentIntentId}`
    }

    return description
  }

  /**
   * Bulk operation for monthly token resets (admin function)
   * @param {Array} userUpdates - Array of {userId, tokenAmount}
   * @returns {Promise<Object>} - Bulk operation result
   */
  async bulkTokenReset(userUpdates) {
    try {
      if (!Array.isArray(userUpdates) || userUpdates.length === 0) {
        throw new Error('User updates array is required')
      }

      const results = []
      const errors = []

      // Process each user update
      for (const update of userUpdates) {
        try {
          const result = await this.addTokens(
            update.userId,
            update.tokenAmount,
            'reset',
            { planName: update.planName, isMonthlyReset: true }
          )
          
          results.push({
            userId: update.userId,
            success: result.success,
            tokensAdded: result.tokensAdded
          })

        } catch (error) {
          errors.push({
            userId: update.userId,
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
      debugError('TokenService.bulkTokenReset error:', error)
      return {
        success: false,
        error: error.message,
        processed: 0
      }
    }
  }

  /**
   * Health check for the token service
   * @returns {Promise<Object>} - Service health status
   */
  async healthCheck() {
    try {
      // Test database connection
      const { data, error } = await supabase.from('plans').select('count').limit(1)
      
      if (error) throw error

      return {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        rateLimitCache: this.rateLimitCache.size
      }

    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Create a default user profile for new users
   * @param {string} userId - User ID
   * @param {string} planName - Plan name (defaults to 'free')
   * @returns {Promise<void>}
   */
  async createDefaultUserProfile(userId, planName = 'free') {
    try {
      // Get the default token amount for the specified plan
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('tokens_per_month')
        .eq('name', planName)
        .single();

      if (planError) {
        console.warn(`⚠️ TokenService: Could not fetch plan data for ${planName}, using fallback:`, planError.message);
      }

      // Use plan-specific tokens, with environment variable override for free plan
      const envCredits = parseInt(process.env.REACT_APP_FREE_PLAN_CREDITS);
      
      let defaultTokens;
      if (planName === 'free') {
        // For free plan, prioritize environment variable over database
        defaultTokens = envCredits || planData?.tokens_per_month || 5;
      } else if (planName === 'pro') {
        defaultTokens = planData?.tokens_per_month || 150;
      } else if (planName === 'unlimited') {
        defaultTokens = planData?.tokens_per_month || 500;
      } else {
        // Fallback for any other plan
        defaultTokens = planData?.tokens_per_month || 5;
      }
      

      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          current_tokens: defaultTokens,
          total_tokens_used: 0,
          plan_name: planName,
          total_used: 0,
          is_admin: false
        });

      if (error) {
        // If profile already exists, that's fine
        if (!error.message?.includes('duplicate key')) {
          throw error;
        }
      }

      debugLog(`✅ TokenService: Created default profile for user ${userId} with ${defaultTokens} tokens (${planName} plan)`);
    } catch (error) {
      debugError('❌ TokenService: Failed to create default profile:', error);
      throw error;
    }
  }

  /**
   * Format token balance response consistently
   * @param {Object} data - Raw token data from database
   * @returns {Object} - Formatted response
   */
  formatTokenBalanceResponse(data) {
    const planName = data?.plan?.name || 'free';
    // Use plan-specific defaults: free = 5, pro = 150, unlimited = 500, fallback = 5
    const defaultTokens = planName === 'pro' ? 150 : planName === 'unlimited' ? 500 : 5;
    
    return {
      success: true,
      balance: {
        current: data?.current_tokens ?? defaultTokens, // Use nullish coalescing with plan-specific defaults
        totalUsed: data?.total_tokens_used || 0,
        resetDate: data?.tokens_reset_at,
        isUnlimited: data?.plan?.is_unlimited || false,
        planName: planName
      },
      plan: data?.plan || { name: 'free', is_unlimited: false },
      subscription: data?.subscription
    };
  }
}

// Export singleton instance
export const tokenService = new TokenService()
export default tokenService