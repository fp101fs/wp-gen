import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { tokenService } from '../services/TokenService'
import { planService } from '../services/PlanService'
import { getCurrentUser, subscribeToTokenUpdates } from '../supabaseClient'
import { debugLog, debugError } from '../utils/debugUtils'

// Token Context
const TokenContext = createContext(null)

// Action types
const TOKEN_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_TOKEN_INFO: 'SET_TOKEN_INFO',
  SET_PLAN_INFO: 'SET_PLAN_INFO',
  SET_SUBSCRIPTION_PERIOD: 'SET_SUBSCRIPTION_PERIOD',
  SET_ERROR: 'SET_ERROR',
  UPDATE_TOKENS: 'UPDATE_TOKENS',
  SET_GENERATION_STATE: 'SET_GENERATION_STATE',
  SET_GENERATION_STATUS: 'SET_GENERATION_STATUS',
  SHOW_UPGRADE_PROMPT: 'SHOW_UPGRADE_PROMPT',
  HIDE_UPGRADE_PROMPT: 'HIDE_UPGRADE_PROMPT',
  SET_SYNC_STATE: 'SET_SYNC_STATE'
}

// Initial state
const initialState = {
  // User & Authentication
  user: null,
  loading: true,
  error: null,
  
  // Token Information
  tokenInfo: null,
  currentTokens: 0,
  totalUsed: 0,
  isUnlimited: false,
  planName: 'free',
  
  // Plan Information
  planInfo: null,
  subscription: null,
  subscriptionPeriodEnd: null, // Stripe subscription period end date
  permissions: {
    canGenerate: false,
    canRevise: false,
    canAccessAnalytics: false,
    hasSubscription: false
  },
  
  // UI State
  showUpgradePrompt: false, // Start with false to prevent initial flash
  upgradeReason: '',
  generationState: 'idle', // 'idle', 'checking', 'generating', 'success', 'error'
  generationStatus: '', // User-friendly status message during generation
  isSyncing: false, // Global sync state
  
  // Real-time updates
  lastUpdated: null
}

// Reducer
const tokenReducer = (state, action) => {
  switch (action.type) {
    case TOKEN_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error
      }
    
    case TOKEN_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload
      }
    
    case TOKEN_ACTIONS.SET_TOKEN_INFO:
      const tokenInfo = action.payload
      return {
        ...state,
        tokenInfo,
        currentTokens: tokenInfo?.balance?.current || 0,
        totalUsed: tokenInfo?.balance?.totalUsed || 0,
        isUnlimited: tokenInfo?.balance?.isUnlimited || false,
        planName: tokenInfo?.balance?.planName || 'free',
        subscription: tokenInfo?.subscription || null,
        lastUpdated: new Date().toISOString(),
        error: null
      }
    
    case TOKEN_ACTIONS.SET_PLAN_INFO:
      const planInfo = action.payload
      return {
        ...state,
        planInfo,
        permissions: planInfo?.permissions || state.permissions,
        error: null
      }
    
    case TOKEN_ACTIONS.SET_SUBSCRIPTION_PERIOD:
      return {
        ...state,
        subscriptionPeriodEnd: action.payload,
        error: null
      }
    
    case TOKEN_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    
    case TOKEN_ACTIONS.UPDATE_TOKENS:
      return {
        ...state,
        currentTokens: action.payload.newBalance,
        totalUsed: state.totalUsed + (action.payload.tokensUsed || 0),
        lastUpdated: new Date().toISOString()
      }
    
    case TOKEN_ACTIONS.SET_GENERATION_STATE:
      return {
        ...state,
        generationState: action.payload,
        // Clear status when returning to idle
        generationStatus: action.payload === 'idle' ? '' : state.generationStatus
      }

    case TOKEN_ACTIONS.SET_GENERATION_STATUS:
      return {
        ...state,
        generationStatus: action.payload
      }
    
    case TOKEN_ACTIONS.SHOW_UPGRADE_PROMPT:
      return {
        ...state,
        showUpgradePrompt: true,
        upgradeReason: action.payload || 'Upgrade needed'
      }
    
    case TOKEN_ACTIONS.HIDE_UPGRADE_PROMPT:
      return {
        ...state,
        showUpgradePrompt: false,
        upgradeReason: ''
      }
    
    case TOKEN_ACTIONS.SET_SYNC_STATE:
      return {
        ...state,
        isSyncing: action.payload
      }
    
    default:
      return state
  }
}

// TokenProvider Component
export const TokenProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tokenReducer, initialState)

  // Initialize user and load token data
  useEffect(() => {
    const initializeTokenContext = async () => {
      try {
        dispatch({ type: TOKEN_ACTIONS.SET_LOADING, payload: true })
        
        // Get current user
        const user = await getCurrentUser()
        if (!user) {
          dispatch({ type: TOKEN_ACTIONS.SET_LOADING, payload: false })
          return
        }
        
        dispatch({ type: TOKEN_ACTIONS.SET_USER, payload: user })
        
        // Load token, plan, and subscription period information
        await Promise.all([
          loadTokenInfo(user.id),
          loadPlanInfo(user.id),
          loadSubscriptionPeriod(user.id)
        ])
        
      } catch (error) {
        console.error('Token context initialization failed:', error)
        dispatch({ type: TOKEN_ACTIONS.SET_ERROR, payload: error.message })
      } finally {
        dispatch({ type: TOKEN_ACTIONS.SET_LOADING, payload: false })
      }
    }

    initializeTokenContext()
  }, [])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!state.user?.id) return

    debugLog('Setting up real-time token updates')
    
    const subscription = subscribeToTokenUpdates(state.user.id, async (payload) => {
      debugLog('Real-time token update received:', payload)
      // Refresh token info when changes are detected
      await loadTokenInfo(state.user.id)
    })

    return () => {
      console.log('Cleaning up token subscription')
      subscription.unsubscribe()
    }
  }, [state.user?.id])

  // Load token information
  const loadTokenInfo = useCallback(async (userId) => {
    try {
      const result = await tokenService.checkTokenBalance(userId)
      
      if (result.success) {
        dispatch({ type: TOKEN_ACTIONS.SET_TOKEN_INFO, payload: result })
      } else {
        console.error('TokenContext: Token service failed:', result.error)
        dispatch({ type: TOKEN_ACTIONS.SET_ERROR, payload: result.error })
      }
    } catch (error) {
      console.error('TokenContext: Failed to load token info:', error)
      dispatch({ type: TOKEN_ACTIONS.SET_ERROR, payload: error.message })
    }
  }, [])

  // Load plan information
  const loadPlanInfo = useCallback(async (userId) => {
    try {
      const result = await tokenService.getUserPlanDetails(userId)
      
      if (result.success) {
        dispatch({ type: TOKEN_ACTIONS.SET_PLAN_INFO, payload: result })
      } else {
        console.error('Failed to load plan info:', result.error)
      }
    } catch (error) {
      console.error('Failed to load plan info:', error)
    }
  }, [])

  // Load subscription period information
  const loadSubscriptionPeriod = useCallback(async (userId) => {
    try {
      const { supabase } = await import('../supabaseClient')
      
      // Get active subscription with period end date
      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .select('current_period_end, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (!error && subscription?.current_period_end) {
        dispatch({ 
          type: TOKEN_ACTIONS.SET_SUBSCRIPTION_PERIOD, 
          payload: subscription.current_period_end 
        })
      } else {
        // No active subscription or error - set to null
        dispatch({ 
          type: TOKEN_ACTIONS.SET_SUBSCRIPTION_PERIOD, 
          payload: null 
        })
      }
    } catch (error) {
      console.error('Failed to load subscription period:', error)
      dispatch({ 
        type: TOKEN_ACTIONS.SET_SUBSCRIPTION_PERIOD, 
        payload: null 
      })
    }
  }, [])

  // Check if user can generate extension
  const canGenerateExtension = useCallback(async (requiredTokens = 1) => {
    if (!state.user?.id) return { canGenerate: false, reason: 'Not authenticated' }

    try {
      dispatch({ type: TOKEN_ACTIONS.SET_GENERATION_STATE, payload: 'checking' })
      
      const permission = await planService.canUserPerformAction(
        state.user.id, 
        'generate_extension',
        { monthlyUsage: 0 } // You could track this if needed
      )
      
      // Check if user has enough tokens for this operation
      const hasEnoughTokens = state.isUnlimited || state.currentTokens >= requiredTokens;
      const canGenerateWithTokens = permission.allowed && hasEnoughTokens;
      
      const result = {
        canGenerate: canGenerateWithTokens,
        reason: !hasEnoughTokens 
          ? `Insufficient credits. Need ${requiredTokens} credit${requiredTokens > 1 ? 's' : ''}, but only have ${state.currentTokens}.`
          : permission.reason,
        requiresUpgrade: permission.requiresUpgrade || (!hasEnoughTokens && !state.isUnlimited),
        tokensAvailable: permission.tokensAvailable || state.currentTokens,
        isUnlimited: state.isUnlimited,
        requiredTokens: requiredTokens
      }

      // Only show upgrade prompt if permission is actually denied
      // and we have valid token data loaded (not during initial loading)
      if (!canGenerateWithTokens && result.requiresUpgrade && state.tokenInfo) {
        dispatch({ type: TOKEN_ACTIONS.SHOW_UPGRADE_PROMPT, payload: result.reason })
      } else if (canGenerateWithTokens) {
        // Hide upgrade prompt if permission is granted
        dispatch({ type: TOKEN_ACTIONS.HIDE_UPGRADE_PROMPT })
      }

      dispatch({ type: TOKEN_ACTIONS.SET_GENERATION_STATE, payload: 'idle' })
      return result

    } catch (error) {
      console.error('Generation permission check failed:', error)
      dispatch({ type: TOKEN_ACTIONS.SET_GENERATION_STATE, payload: 'error' })
      return { canGenerate: false, reason: error.message }
    }
  }, [state.user?.id, state.currentTokens, state.isUnlimited])

  // Generate extension with token deduction
  const generateWithTokens = useCallback(async (generationFunction, description = 'Extension generation', tokenCost = 1) => {
    if (!state.user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      dispatch({ type: TOKEN_ACTIONS.SET_GENERATION_STATE, payload: 'checking' })

      // Check permission first (account for custom token cost)
      const permissionCheck = await canGenerateExtension(tokenCost)
      if (!permissionCheck.canGenerate) {
        dispatch({ type: TOKEN_ACTIONS.SET_GENERATION_STATE, payload: 'error' })
        
        // If user needs to upgrade, show upgrade modal instead of throwing error
        if (permissionCheck.requiresUpgrade) {
          dispatch({ type: TOKEN_ACTIONS.SHOW_UPGRADE_PROMPT, payload: permissionCheck.reason })
          return {
            success: false,
            error: permissionCheck.reason,
            requiresUpgrade: true
          }
        }
        
        // For other errors (non-upgrade issues), throw the error
        throw new Error(permissionCheck.reason)
      }

      dispatch({ type: TOKEN_ACTIONS.SET_GENERATION_STATE, payload: 'generating' })

      // Execute the generation function (your existing AI logic)
      const generationResult = await generationFunction()
      
      if (!generationResult.success) {
        dispatch({ type: TOKEN_ACTIONS.SET_GENERATION_STATE, payload: 'error' })
        throw new Error(generationResult.error || 'Generation failed')
      }

      // Deduct tokens after successful generation (custom amount for premium models)
      const deductionResult = await tokenService.deductToken(
        state.user.id,
        tokenCost,
        description,
        generationResult.extensionId || null
      )

      if (!deductionResult.success) {
        console.error('Token deduction failed after generation:', deductionResult.error)
        // Generation succeeded but token deduction failed - log for manual review
      }

      // Update state with optimistic update
      if (deductionResult.success && !state.isUnlimited) {
        dispatch({ 
          type: TOKEN_ACTIONS.UPDATE_TOKENS, 
          payload: { 
            newBalance: deductionResult.tokensRemaining,
            tokensUsed: tokenCost
          }
        })
      }

      dispatch({ type: TOKEN_ACTIONS.SET_GENERATION_STATE, payload: 'success' })

      return {
        ...generationResult,
        tokenInfo: {
          tokensRemaining: deductionResult.tokensRemaining,
          unlimited: deductionResult.unlimited,
          transactionId: deductionResult.transactionId
        }
      }

    } catch (error) {
      console.error('Generation with tokens failed:', error)
      dispatch({ type: TOKEN_ACTIONS.SET_GENERATION_STATE, payload: 'error' })
      throw error
    }
  }, [state.user?.id, state.isUnlimited, canGenerateExtension])

  // Refresh all data
  const refresh = useCallback(async () => {
    if (!state.user?.id) return

    dispatch({ type: TOKEN_ACTIONS.SET_LOADING, payload: true })
    try {
      await Promise.all([
        loadTokenInfo(state.user.id),
        loadPlanInfo(state.user.id),
        loadSubscriptionPeriod(state.user.id)
      ])
    } catch (error) {
      console.error('Refresh failed:', error)
      dispatch({ type: TOKEN_ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: TOKEN_ACTIONS.SET_LOADING, payload: false })
    }
  }, [state.user?.id, loadTokenInfo, loadPlanInfo])

  // Show upgrade prompt manually
  const showUpgradePrompt = useCallback((reason) => {
    dispatch({ type: TOKEN_ACTIONS.SHOW_UPGRADE_PROMPT, payload: reason })
  }, [])

  // Hide upgrade prompt
  const hideUpgradePrompt = useCallback(() => {
    dispatch({ type: TOKEN_ACTIONS.HIDE_UPGRADE_PROMPT })
  }, [])

  // Sync state management
  const setSyncState = useCallback((syncing) => {
    dispatch({ type: TOKEN_ACTIONS.SET_SYNC_STATE, payload: syncing })
  }, [])

  // Generation status management (user-friendly status messages)
  const setGenerationStatus = useCallback((status) => {
    dispatch({ type: TOKEN_ACTIONS.SET_GENERATION_STATUS, payload: status })
  }, [])

  // Context value
  const contextValue = {
    // State
    ...state,

    // Actions
    canGenerateExtension,
    generateWithTokens,
    refresh,
    showUpgradePromptAction: showUpgradePrompt, // Rename the function to avoid collision
    hideUpgradePrompt,
    setSyncState,
    setGenerationStatus,
    
    // Computed values
    hasTokens: state.isUnlimited || state.currentTokens > 0,
    tokenStatus: getTokenStatus(state.currentTokens, state.isUnlimited),
    planDisplayName: getPlanDisplayName(state.planName),
    
    // Loading states
    isLoading: state.loading,
    isGenerating: state.generationState === 'generating',
    isCheckingPermission: state.generationState === 'checking'
  }

  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  )
}

// Custom hook to use token context
export const useTokenContext = () => {
  const context = useContext(TokenContext)
  if (!context) {
    throw new Error('useTokenContext must be used within a TokenProvider')
  }
  return context
}

// Helper functions
const getTokenStatus = (tokens, isUnlimited) => {
  if (isUnlimited) return 'unlimited'
  if (tokens === 0) return 'depleted'
  if (tokens <= 2) return 'low'
  return 'good'
}

const getPlanDisplayName = (planName) => {
  const displayNames = {
    'free': 'Free',
    'pro': 'Pro',
    'unlimited': 'Max'
  }
  return displayNames[planName] || planName
}

export default TokenProvider