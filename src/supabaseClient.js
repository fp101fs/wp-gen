
import { createClient } from '@supabase/supabase-js'
import { debugLog } from './utils/debugUtils'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

debugLog('Supabase URL:', supabaseUrl);
debugLog('Supabase Anon Key:', supabaseAnonKey ? 'Loaded' : 'Not Loaded');

// Enhanced Supabase client with auth persistence and real-time
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

// Re-export enhanced client functions for backward compatibility
export { tokenApi, handleSupabaseError, getCurrentUser, signOut, subscribeToTokenUpdates, subscribeToSubscriptionUpdates } from './supabase/client'
