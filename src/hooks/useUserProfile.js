import { useState, useEffect, useCallback } from 'react'
import { tokenApi, subscribeToSubscriptionUpdates, getCurrentUser } from '../supabase/client'

/**
 * Custom hook for managing user profile, subscription, and plan data
 * Handles user profile information, subscription status, and available plans
 */
export const useUserProfile = () => {
  const [profile, setProfile] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [plans, setPlans] = useState([])
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

  // Fetch user profile data
  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      
      // Get token info (includes profile data)
      const { data: tokenData, error: tokenError } = await tokenApi.getUserTokenInfo(user.id)
      
      if (tokenError) {
        setError(tokenError.message)
        console.error('Profile fetch error:', tokenError)
        return
      }

      // Transform token data to profile format
      if (tokenData) {
        setProfile({
          id: user.id,
          current_tokens: tokenData.current_tokens,
          total_tokens_used: tokenData.total_tokens_used,
          tokens_reset_at: tokenData.tokens_reset_at,
          created_at: user.created_at,
          updated_at: new Date().toISOString()
        })
      }
    } catch (err) {
      setError('Failed to fetch profile information')
      console.error('Profile fetch error:', err)
    }
  }, [user])

  // Fetch user subscription
  const fetchSubscription = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data, error: apiError } = await tokenApi.getUserSubscription(user.id)
      
      if (apiError) {
        console.error('Subscription fetch error:', apiError)
        // Don't set error for subscription - it's okay if user has no subscription
      } else {
        setSubscription(data)
      }
    } catch (err) {
      console.error('Subscription fetch error:', err)
    }
  }, [user?.id])

  // Fetch available plans
  const fetchPlans = useCallback(async () => {
    try {
      const { data, error: apiError } = await tokenApi.getPlans()
      
      if (apiError) {
        console.error('Plans fetch error:', apiError)
      } else {
        setPlans(data || [])
      }
    } catch (err) {
      console.error('Plans fetch error:', err)
    }
  }, [])

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      fetchProfile(),
      fetchSubscription(),
      fetchPlans()
    ])
    setLoading(false)
  }, [fetchProfile, fetchSubscription, fetchPlans])

  // Initial data fetch
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Set up real-time subscription updates
  useEffect(() => {
    if (!user?.id) return

    console.log('Setting up real-time subscription updates for user:', user.id)
    
    const subscription = subscribeToSubscriptionUpdates(user.id, (payload) => {
      console.log('Subscription update received:', payload)
      // Refetch subscription and profile when changes are detected
      fetchSubscription()
      fetchProfile()
    })

    return () => {
      console.log('Unsubscribing from subscription updates')
      subscription.unsubscribe()
    }
  }, [user?.id, fetchSubscription, fetchProfile])

  // Get current plan information
  const getCurrentPlan = useCallback(() => {
    if (!profile && !subscription) return null

    // If user has active subscription, return that plan
    if (subscription?.plans) {
      return {
        ...subscription.plans,
        subscription_status: subscription.status,
        current_period_end: subscription.current_period_end
      }
    }

    // Otherwise return free plan
    const freePlan = plans.find(plan => plan.name === 'free')
    return freePlan || {
      name: 'free',
      description: 'Free tier',
      price_cents: 0,
      tokens_per_month: 5,
      is_unlimited: false
    }
  }, [profile, subscription, plans])

  // Check if user can upgrade to a plan
  const canUpgradeTo = useCallback((planName) => {
    const currentPlan = getCurrentPlan()
    if (!currentPlan) return true

    const targetPlan = plans.find(plan => plan.name === planName)
    if (!targetPlan) return false

    // Can always upgrade to higher priced plans
    return targetPlan.price_cents > currentPlan.price_cents
  }, [getCurrentPlan, plans])

  // Get plan by name
  const getPlanByName = useCallback((planName) => {
    return plans.find(plan => plan.name === planName) || null
  }, [plans])

  // Check subscription status
  const getSubscriptionStatus = useCallback(() => {
    if (!subscription) return 'none'
    
    return {
      status: subscription.status,
      active: subscription.status === 'active',
      period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end
    }
  }, [subscription])

  // Get token history
  const getTokenHistory = useCallback(async (limit = 50) => {
    if (!user?.id) return { data: null, error: 'User not authenticated' }

    try {
      const { data, error: apiError } = await tokenApi.getTokenHistory(user.id, limit)
      
      if (apiError) {
        return { data: null, error: apiError.message }
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: 'Failed to fetch token history' }
    }
  }, [user?.id])

  // Manual refresh function
  const refetch = useCallback(async () => {
    await fetchAllData()
  }, [fetchAllData])

  return {
    // State
    profile,
    subscription,
    plans,
    loading,
    error,
    user,
    
    // Actions
    refetch,
    getTokenHistory,
    
    // Computed values
    getCurrentPlan,
    canUpgradeTo,
    getPlanByName,
    getSubscriptionStatus,
    
    // Convenience values
    currentPlan: getCurrentPlan(),
    subscriptionStatus: getSubscriptionStatus(),
    hasActiveSubscription: subscription?.status === 'active',
    isSubscribed: !!subscription,
    
    // Plan helpers
    freePlan: plans.find(plan => plan.name === 'free'),
    proPlan: plans.find(plan => plan.name === 'pro'),
    unlimitedPlan: plans.find(plan => plan.name === 'unlimited')
  }
}

export default useUserProfile