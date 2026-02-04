// Database types for our token system
export interface Database {
  public: {
    Tables: {
      plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price_cents: number
          tokens_per_month: number | null
          is_unlimited: boolean
          stripe_price_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price_cents?: number
          tokens_per_month?: number | null
          is_unlimited?: boolean
          stripe_price_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_cents?: number
          tokens_per_month?: number | null
          is_unlimited?: boolean
          stripe_price_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          current_tokens: number
          total_tokens_used: number
          tokens_reset_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          current_tokens?: number
          total_tokens_used?: number
          tokens_reset_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          current_tokens?: number
          total_tokens_used?: number
          tokens_reset_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'canceled' | 'past_due' | 'incomplete'
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: 'active' | 'canceled' | 'past_due' | 'incomplete'
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'incomplete'
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      token_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'reset'
          description: string | null
          extension_id: string | null
          subscription_id: string | null
          balance_after: number
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'reset'
          description?: string | null
          extension_id?: string | null
          subscription_id?: string | null
          balance_after: number
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: 'purchase' | 'usage' | 'refund' | 'bonus' | 'reset'
          description?: string | null
          extension_id?: string | null
          subscription_id?: string | null
          balance_after?: number
          metadata?: Record<string, any> | null
          created_at?: string
        }
      }
    }
    Functions: {
      get_user_token_info: {
        Args: {
          user_uuid?: string
        }
        Returns: {
          current_tokens: number
          total_tokens_used: number
          tokens_reset_at: string | null
          plan: {
            name: string
            tokens_per_month: number | null
            is_unlimited: boolean
          }
          subscription: {
            status: string
            current_period_end: string
          } | null
        }
      }
      deduct_tokens: {
        Args: {
          user_uuid: string
          tokens_to_deduct: number
          description?: string
          ext_id?: string
        }
        Returns: {
          success: boolean
          tokens_remaining: number
          unlimited: boolean
          transaction_id?: string
          error?: string
          tokens_needed?: number
        }
      }
      add_tokens: {
        Args: {
          user_uuid: string
          tokens_to_add: number
          transaction_type?: string
          description?: string
          subscription_uuid?: string
        }
        Returns: {
          success: boolean
          tokens_added: number
          new_balance: number
          transaction_id: string
        }
      }
    }
  }
}

// Convenience types
export type Plan = Database['public']['Tables']['plans']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row']
export type TokenTransaction = Database['public']['Tables']['token_transactions']['Row']

// API response types
export type TokenInfo = Database['public']['Functions']['get_user_token_info']['Returns']
export type DeductTokenResult = Database['public']['Functions']['deduct_tokens']['Returns']
export type AddTokenResult = Database['public']['Functions']['add_tokens']['Returns']

// Enhanced types with relations
export type SubscriptionWithPlan = UserSubscription & {
  plans: Plan
}

export type TokenTransactionWithExtension = TokenTransaction & {
  extensions?: {
    id: string
    name: string
  }
}

// Plan types enum
export enum PlanType {
  FREE = 'free',
  PRO = 'pro',
  UNLIMITED = 'unlimited'
}

export enum TransactionType {
  PURCHASE = 'purchase',
  USAGE = 'usage', 
  REFUND = 'refund',
  BONUS = 'bonus',
  RESET = 'reset'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  INCOMPLETE = 'incomplete'
}

// Frontend UI types
export interface TokenBalance {
  current: number
  total_used: number
  reset_date: string | null
  is_unlimited: boolean
  plan_name: string
}

export interface ApiResponse<T> {
  data: T | null
  error: {
    message: string
    code?: string
    details?: string
    hint?: string
  } | null
}

// Hook types
export interface UseTokensReturn {
  tokenInfo: TokenInfo | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  deductTokens: (amount: number, description?: string, extensionId?: string) => Promise<DeductTokenResult>
  addTokens: (amount: number, type?: string, description?: string) => Promise<AddTokenResult>
}

export interface UseUserProfileReturn {
  profile: UserProfile | null
  subscription: SubscriptionWithPlan | null
  plans: Plan[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}