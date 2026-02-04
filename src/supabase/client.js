import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create enhanced Supabase client with auth persistence and real-time
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Helper function to handle Supabase errors consistently
export const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase error${context ? ` in ${context}` : ''}:`, error)
  
  // Map common Supabase errors to user-friendly messages
  const errorMessages = {
    'PGRST301': 'You do not have permission to perform this action.',
    'PGRST116': 'No data found.',
    '23505': 'This record already exists.',
    '23503': 'Referenced record does not exist.',
    '42501': 'Insufficient permissions.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-not-found': 'User not found.',
    'auth/wrong-password': 'Incorrect password.',
  }
  
  const userMessage = errorMessages[error.code] || error.message || 'An unexpected error occurred.'
  
  return {
    message: userMessage,
    code: error.code,
    details: error.details,
    hint: error.hint,
  }
}

// Enhanced auth helpers
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    // Only log errors that aren't "no session" errors
    if (!error.message?.includes('Auth session missing')) {
      console.error('Error getting current user:', error)
    }
    return null
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error signing out:', error)
    return { success: false, error: handleSupabaseError(error, 'signOut') }
  }
}

// Token-specific database functions
export const tokenApi = {
  // Get user token info using our database function
  getUserTokenInfo: async (userId = null) => {
    try {
      // Try the current user if no userId provided
      if (!userId) {
        const currentUser = await getCurrentUser()
        userId = currentUser?.id
      }
      
      const { data, error } = await supabase.rpc('get_user_token_info', {
        user_uuid: userId
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('getUserTokenInfo error:', error)
      return { data: null, error: handleSupabaseError(error, 'getUserTokenInfo') }
    }
  },

  // Deduct tokens using our database function
  deductTokens: async (userId, amount, description = 'Extension generation', extensionId = null) => {
    try {
      const { data, error } = await supabase.rpc('deduct_tokens', {
        user_uuid: userId,
        tokens_to_deduct: amount,
        description: description,
        ext_id: extensionId
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'deductTokens') }
    }
  },

  // Add tokens using our database function
  addTokens: async (userId, amount, type = 'purchase', description = 'Token purchase', subscriptionId = null) => {
    try {
      const { data, error } = await supabase.rpc('add_tokens', {
        p_user_id: userId,
        p_amount: amount,
        p_type: type,
        p_description: description,
        p_subscription_id: subscriptionId
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'addTokens') }
    }
  },

  // Get token transaction history
  getTokenHistory: async (userId, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select(`
          id,
          amount,
          transaction_type,
          description,
          balance_after,
          created_at,
          extension_id,
          metadata
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'getTokenHistory') }
    }
  },

  // Get all active plans
  getPlans: async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'getPlans') }
    }
  },

  // Get user's current subscription
  getUserSubscription: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plans (
            id,
            name,
            description,
            price_cents,
            tokens_per_month,
            is_unlimited
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return { data: error?.code === 'PGRST116' ? null : data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error, 'getUserSubscription') }
    }
  }
}

// Real-time subscription helpers
export const subscribeToTokenUpdates = (userId, callback) => {
  const subscription = supabase
    .channel('token-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${userId}`
      },
      (payload) => {
        console.log('Token balance updated:', payload)
        callback(payload)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'token_transactions',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('New token transaction:', payload)
        callback(payload)
      }
    )
    .subscribe()

  return subscription
}

export const subscribeToSubscriptionUpdates = (userId, callback) => {
  const subscription = supabase
    .channel('subscription-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_subscriptions',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('Subscription updated:', payload)
        callback(payload)
      }
    )
    .subscribe()

  return subscription
}

export default supabase