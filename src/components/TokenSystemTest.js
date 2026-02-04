import React from 'react'
import { useTokens } from '../hooks/useTokens'
import { useUserProfile } from '../hooks/useUserProfile'

/**
 * Test component to verify token system integration
 * This won't break existing code - it's just for testing
 */
const TokenSystemTest = () => {
  const { 
    currentTokens, 
    isUnlimited, 
    planName,
    hasTokens,
    loading: tokenLoading,
    error: tokenError,
    canPerformAction,
    deductTokens,
    getTokenBalance
  } = useTokens()

  const {
    currentPlan,
    subscription,
    plans,
    loading: profileLoading,
    error: profileError,
    subscriptionStatus
  } = useUserProfile()

  const handleTestDeduction = async () => {
    try {
      const result = await deductTokens(1, 'Test deduction from React')
      console.log('Deduction result:', result)
      alert(`Token deduction ${result.success ? 'successful' : 'failed'}: ${JSON.stringify(result)}`)
    } catch (error) {
      console.error('Deduction error:', error)
      alert(`Error: ${error.message}`)
    }
  }

  if (tokenLoading || profileLoading) {
    return (
      <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 m-4">
        <h3 className="text-blue-800 font-bold">Token System Test</h3>
        <p className="text-blue-600">Loading token data...</p>
      </div>
    )
  }

  return (
    <div className="bg-green-100 border border-green-300 rounded-lg p-4 m-4 max-w-2xl">
      <h3 className="text-green-800 font-bold text-lg mb-4">🧪 Token System Test</h3>
      
      {(tokenError || profileError) && (
        <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
          <p className="text-red-700">Error: {tokenError || profileError}</p>
        </div>
      )}

      {/* Token Info */}
      <div className="mb-4">
        <h4 className="font-semibold text-green-700 mb-2">Token Information:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Current Tokens: <strong>{currentTokens}</strong></div>
          <div>Plan: <strong>{planName}</strong></div>
          <div>Has Tokens: <strong>{hasTokens ? 'Yes' : 'No'}</strong></div>
          <div>Is Unlimited: <strong>{isUnlimited ? 'Yes' : 'No'}</strong></div>
          <div>Can Generate: <strong>{canPerformAction(1) ? 'Yes' : 'No'}</strong></div>
        </div>
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <div className="mb-4">
          <h4 className="font-semibold text-green-700 mb-2">Current Plan:</h4>
          <div className="text-sm">
            <div>Name: <strong>{currentPlan.name}</strong></div>
            <div>Price: <strong>${(currentPlan.price_cents / 100).toFixed(2)}</strong></div>
            <div>Tokens/Month: <strong>{currentPlan.is_unlimited ? 'Unlimited' : currentPlan.tokens_per_month}</strong></div>
          </div>
        </div>
      )}

      {/* Subscription Status */}
      {subscription && (
        <div className="mb-4">
          <h4 className="font-semibold text-green-700 mb-2">Subscription:</h4>
          <div className="text-sm">
            <div>Status: <strong>{subscriptionStatus.status}</strong></div>
            <div>Active: <strong>{subscriptionStatus.active ? 'Yes' : 'No'}</strong></div>
            {subscriptionStatus.period_end && (
              <div>Ends: <strong>{new Date(subscriptionStatus.period_end).toLocaleDateString()}</strong></div>
            )}
          </div>
        </div>
      )}

      {/* Available Plans */}
      {plans.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-green-700 mb-2">Available Plans:</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded p-2 border">
                <div><strong>{plan.name}</strong></div>
                <div>${(plan.price_cents / 100).toFixed(2)}</div>
                <div>{plan.is_unlimited ? 'Unlimited' : `${plan.tokens_per_month} tokens`}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Button */}
      <div className="mt-4">
        <button
          onClick={handleTestDeduction}
          disabled={!canPerformAction(1)}
          className={`px-4 py-2 rounded font-medium ${
            canPerformAction(1)
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Test Token Deduction (1 token)
        </button>
        <p className="text-xs text-gray-600 mt-1">
          This will deduct 1 token and show the result
        </p>
      </div>

      {/* Token Balance Details */}
      {getTokenBalance() && (
        <div className="mt-4 text-xs text-gray-600">
          <strong>Raw Token Balance:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(getTokenBalance(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default TokenSystemTest