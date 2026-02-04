import { useState, useEffect, useCallback } from 'react'
import { tokenApi, subscribeToTokenUpdates, getCurrentUser } from '../supabase/client'

/**
 * Custom hook for managing user tokens
 * Handles token balance, deduction, addition, and real-time updates
 */
export const useTokens = () => {
  const [tokenInfo, setTokenInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  // Get current user
  useEffect(() => {
    const initializeUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    initializeUser()
  }, [])

  // Fetch token information
  const fetchTokenInfo = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: apiError } = await tokenApi.getUserTokenInfo(user.id)
      
      if (apiError) {
        setError(apiError.message)
        console.error('Token fetch error:', apiError)
      } else {
        setTokenInfo(data)
      }
    } catch (err) {
      setError('Failed to fetch token information')
      console.error('Token fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Initial fetch when user is available
  useEffect(() => {
    fetchTokenInfo()
  }, [fetchTokenInfo])

  // Set up real-time subscription for token updates
  useEffect(() => {
    if (!user?.id) return

    console.log('Setting up real-time token subscription for user:', user.id)
    
    const subscription = subscribeToTokenUpdates(user.id, (payload) => {
      console.log('Token update received:', payload)
      // Refetch token info when changes are detected
      fetchTokenInfo()
    })

    return () => {
      console.log('Unsubscribing from token updates')
      subscription.unsubscribe()
    }
  }, [user?.id, fetchTokenInfo])

  // Deduct tokens function
  const deductTokens = useCallback(async (amount, description = 'Extension generation', extensionId = null) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      setError(null)
      
      const { data, error: apiError } = await tokenApi.deductTokens(
        user.id, 
        amount, 
        description, 
        extensionId
      )
      
      if (apiError) {
        setError(apiError.message)
        throw new Error(apiError.message)
      }

      // If successful, refresh token info
      if (data?.success) {
        await fetchTokenInfo()
      }

      return data
    } catch (err) {
      const errorMessage = err.message || 'Failed to deduct tokens'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [user?.id, fetchTokenInfo])

  // Add tokens function
  const addTokens = useCallback(async (amount, type = 'purchase', description = 'Token purchase', subscriptionId = null) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      setError(null)
      
      const { data, error: apiError } = await tokenApi.addTokens(
        user.id,
        amount,
        type,
        description,
        subscriptionId
      )
      
      if (apiError) {
        setError(apiError.message)
        throw new Error(apiError.message)
      }

      // If successful, refresh token info
      if (data?.success) {
        await fetchTokenInfo()
      }

      return data
    } catch (err) {
      const errorMessage = err.message || 'Failed to add tokens'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [user?.id, fetchTokenInfo])

  // Check if user can perform action (has enough tokens)
  const canPerformAction = useCallback((requiredTokens = 1) => {
    if (!tokenInfo) return false
    
    // Unlimited users can always perform actions
    if (tokenInfo.plan?.is_unlimited) return true
    
    // Check if user has enough tokens
    return tokenInfo.current_tokens >= requiredTokens
  }, [tokenInfo])

  // Get user's plan details
  const getPlanDetails = useCallback(() => {
    if (!tokenInfo) return null
    
    return {
      name: tokenInfo.plan?.name || 'free',
      tokensPerMonth: tokenInfo.plan?.tokens_per_month,
      isUnlimited: tokenInfo.plan?.is_unlimited || false,
      subscription: tokenInfo.subscription
    }
  }, [tokenInfo])

  // Get formatted token balance for display
  const getTokenBalance = useCallback(() => {
    if (!tokenInfo) return null
    
    return {
      current: tokenInfo.current_tokens || 0,
      total_used: tokenInfo.total_tokens_used || 0,
      reset_date: tokenInfo.tokens_reset_at,
      is_unlimited: tokenInfo.plan?.is_unlimited || false,
      plan_name: tokenInfo.plan?.name || 'free'
    }
  }, [tokenInfo])

  // Refresh token info manually
  const refetch = useCallback(async () => {
    await fetchTokenInfo()
  }, [fetchTokenInfo])

  return {
    // State
    tokenInfo,
    loading,
    error,
    user,
    
    // Actions
    deductTokens,
    addTokens,
    refetch,
    
    // Computed values
    canPerformAction,
    getPlanDetails,
    getTokenBalance,
    
    // Convenience values
    currentTokens: tokenInfo?.current_tokens || 0,
    isUnlimited: tokenInfo?.plan?.is_unlimited || false,
    planName: tokenInfo?.plan?.name || 'free',
    hasTokens: tokenInfo ? (tokenInfo.plan?.is_unlimited || tokenInfo.current_tokens > 0) : false
  }
}

export default useTokens