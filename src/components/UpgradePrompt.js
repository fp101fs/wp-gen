import React, { useState } from 'react'
import { X, Crown, Zap, Check, ArrowRight } from 'lucide-react'
import { useTokenContext } from '../contexts/TokenContext'
import { planService, USER_TYPES } from '../services/PlanService'
import { stripeService } from '../services/StripeService'
import { debugLog, debugError } from '../utils/debugUtils'
import { supabase } from '../supabaseClient'

/**
 * UpgradePrompt Component
 * Shows upgrade prompts when users hit token/feature limits
 */
const UpgradePrompt = ({ 
  isOpen, 
  onClose, 
  trigger = 'token_limit',
  customMessage = null 
}) => {
  const {
    currentTokens,
    planName,
    planDisplayName,
    upgradeReason,
    hideUpgradePrompt
  } = useTokenContext()

  const [selectedPlan, setSelectedPlan] = useState(USER_TYPES.FREELANCER)
  const [billingCycle, setBillingCycle] = useState('monthly')

  if (!isOpen) return null

  const allPlans = planService.getAllPlans()
  const currentPlan = allPlans[planName]
  const targetPlan = allPlans[selectedPlan]

  const getUpgradeMessage = () => {
    if (customMessage) return customMessage
    if (upgradeReason) return upgradeReason

    switch (trigger) {
      case 'token_limit':
        return `You've used all ${currentTokens === 0 ? 'your' : 'available'} credits. Upgrade to continue generating extensions!`
      case 'feature_limit':
        return 'This feature is available in higher plans. Upgrade to unlock it!'
      case 'revision_limit':
        return 'You\'ve reached your revision limit. Upgrade for unlimited revisions!'
      default:
        return 'Upgrade your plan to access more features and credits!'
    }
  }

  const getRecommendedPlans = () => {
    if (planName === USER_TYPES.FREE) {
      return [USER_TYPES.FREELANCER, USER_TYPES.AGENCY, USER_TYPES.ENTERPRISE]
    } else if (planName === USER_TYPES.FREELANCER) {
      return [USER_TYPES.AGENCY, USER_TYPES.ENTERPRISE]
    } else if (planName === USER_TYPES.AGENCY) {
      return [USER_TYPES.ENTERPRISE]
    }
    return []
  }

  const recommendedPlans = getRecommendedPlans()

  const calculateSavings = (plan) => {
    if (plan.price.yearly === 0) return 0
    const monthlyTotal = plan.price.monthly * 12
    const savings = monthlyTotal - plan.price.yearly
    return Math.round(savings)
  }

  const getBenefits = (planType) => {
    const plan = allPlans[planType]
    const benefits = []

    // Feature 1: Credits/month
    if (plan.tokens.included === -1) {
      benefits.push('Unlimited credits')
    } else {
      benefits.push(`${plan.tokens.included} credits/month`)
    }

    // Feature 2: Unlimited revisions for paid plans
    if (planType !== USER_TYPES.FREE) {
      benefits.push('Unlimited revisions')
    }

    // Feature 3: Priority support (Agency+)
    if (planType === USER_TYPES.AGENCY || planType === USER_TYPES.ENTERPRISE) {
      benefits.push('Priority support')
    }

    // Feature 4: Team collaboration (Agency+)
    if (planType === USER_TYPES.AGENCY || planType === USER_TYPES.ENTERPRISE) {
      benefits.push('Team collaboration')
    }

    // Feature 5: API access (Enterprise only)
    if (planType === USER_TYPES.ENTERPRISE) {
      benefits.push('API access')
    }

    return benefits
  }

  const handleUpgrade = async (planType) => {
    try {
      debugLog('🔄 Starting upgrade process:', planType, 'billing:', billingCycle);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert('Please log in to upgrade your plan');
        return;
      }

      // Get the plan configuration
      const plan = allPlans[planType];
      if (!plan) {
        alert('Invalid plan selected');
        return;
      }

      // Get the Stripe price ID for the selected billing cycle
      const priceId = plan.stripe_price_ids[billingCycle];
      if (!priceId) {
        alert('Pricing information not available. Please try again.');
        return;
      }

      // Create checkout session
      const checkoutData = {
        priceId,
        customerId: user.id,
        userEmail: user.email,
        planType,
        billingCycle
      };

      // Note: Removed auto-applied coupon (expired Sep 30)
      debugLog('🎯 Pro plan upgrade - no coupon auto-applied');

      debugLog('🔄 Creating checkout session with:', checkoutData);

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      debugLog('✅ Checkout session created:', data.sessionId);

      // Redirect to Stripe Checkout
      await stripeService.redirectToCheckout({ sessionId: data.sessionId });

    } catch (error) {
      debugError('❌ Upgrade error:', error);
      alert(`Failed to start checkout: ${error.message}`);
    }
  }

  const handleClose = () => {
    hideUpgradePrompt()
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-950/95 backdrop-blur-lg rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upgrade Your Plan</h2>
              <p className="text-gray-300 text-sm">Unlock more credits and features</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Message */}
        <div className="p-6 bg-gradient-to-r from-lime-900/20 to-neutral-900/30 border-b border-white/10">
          <p className="text-white text-center font-medium mb-3">
            {getUpgradeMessage()}
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
            <div className="flex items-center space-x-1">
              <Check className="w-4 h-4 text-green-400" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center space-x-1">
              <Check className="w-4 h-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-1">
              <Check className="w-4 h-4 text-green-400" />
              <span>30-day guarantee</span>
            </div>
          </div>
        </div>


        {/* Billing Cycle Toggle */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-center">
            <div className="bg-neutral-900 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-lime-400 text-black shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-lime-400 text-black shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className={`grid gap-6 ${recommendedPlans.length === 1 ? 'grid-cols-1 justify-items-center' : recommendedPlans.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
            {recommendedPlans.map((planType) => {
              const plan = allPlans[planType]
              const benefits = getBenefits(planType)
              const savings = calculateSavings(plan)
              const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly
              const isPopular = plan.popular

              return (
                <div
                  key={planType}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all bg-white/5 backdrop-blur-lg ${
                    recommendedPlans.length === 1 ? 'max-w-md w-full' : ''
                  } ${
                    selectedPlan === planType
                      ? 'border-lime-400 bg-lime-900/20'
                      : 'border-white/20 hover:border-white/40'
                  } ${isPopular ? 'ring-2 ring-lime-400/50' : ''}`}
                  onClick={() => setSelectedPlan(planType)}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-lime-400 text-black px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {plan.displayName}
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      {plan.description}
                    </p>
                    
                    <div className="mb-2">
                      {billingCycle === 'yearly' ? (
                        <div>
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-lg text-gray-400 line-through">
                              ${plan.price.monthly * 12}
                            </span>
                            <span className="text-3xl font-bold text-white">
                              ${price}
                            </span>
                          </div>
                          <span className="text-gray-300 text-sm">per year</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-3xl font-bold text-white">
                            ${price}
                          </span>
                          <span className="text-gray-300">/month</span>
                        </div>
                      )}
                    </div>
                    
                    {billingCycle === 'yearly' && savings > 0 && (
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                        Save ${savings}/year (${Math.round((savings / (plan.price.monthly * 12)) * 100)}% off)
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    {benefits.slice(0, 4).map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{benefit}</span>
                      </div>
                    ))}
                    
                    {benefits.length > 4 && (
                      <div className="text-gray-400 text-sm">
                        +{benefits.length - 4} more features
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpgrade(planType)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 ${
                      selectedPlan === planType
                        ? 'bg-lime-400 hover:bg-lime-500 text-black shadow-lg'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                    }`}
                  >
                    <span>
                      {planType === USER_TYPES.FREELANCER ? 'Get Started' : `Go ${allPlans[planType].displayName}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gradient-to-r from-lime-900/20 to-neutral-900/30 border-t border-white/10 rounded-b-2xl">
          <div className="text-center mb-4">
            <p className="text-sm text-white font-medium mb-2">
              🚀 Join 10,000+ developers already creating with Kromio AI
            </p>
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-300">
              <span>✨ Instant upgrade</span>
              <span>🔒 Secure checkout</span>
              <span>💸 Money-back guarantee</span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-200 text-sm underline underline-offset-2"
            >
              I'll stay on the free plan for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpgradePrompt