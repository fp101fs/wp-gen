import React, { useState } from 'react';
import { Check, X, Crown, Zap, Gift } from 'lucide-react';
import Header from './Header';
import FeaturesModal from './FeaturesModal';
import PageContainer from './components/PageContainer';
import { useTokenContext } from './contexts/TokenContext';
import useDocumentTitle from './hooks/useDocumentTitle';
import { supabase } from './supabaseClient';
import { planService } from './services/PlanService';
import { debugLog, debugError } from './utils/debugUtils';

function PricingPage({ session, sessionLoading, onShowLoginModal }) {
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { showUpgradePromptAction } = useTokenContext();
  
  // Set page title
  useDocumentTitle('Pricing - PlugPress AI Plugin Builder');

  const handleGetStarted = async (tier, planType) => {
    if (!session) {
      onShowLoginModal();
      return;
    }

    // Handle different tiers
    if (tier === 'Free') {
      // Already on free - redirect to main app
      window.location.href = '/';
      return;
    }

    // For paid plans, go directly to Stripe checkout
    if (planType && planType !== 'free') {
      setLoadingPlan(tier);

      try {
        debugLog('🔄 Starting direct checkout for:', tier, planType);

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          alert('Please log in to upgrade your plan');
          return;
        }

        // Get all plans from planService
        const allPlans = planService.getAllPlans();
        const plan = allPlans[planType];
        
        if (!plan) {
          alert('Invalid plan selected');
          return;
        }

        // Get billing cycle (default to monthly for pricing page)
        const billingCycle = annualBilling ? 'yearly' : 'monthly';
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
        debugLog('🎯 Pro plan - no coupon auto-applied');

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
          debugError('❌ Server error response:', data);
          throw new Error(data.details || data.error || 'Failed to create checkout session');
        }

        debugLog('✅ Checkout session created:', data.sessionId);
        debugLog('📋 Server response:', data);

        // Redirect to Stripe Checkout
        // Lazy load stripe service only when payment is needed
        const { stripeService } = await import('./services/StripeService');
        await stripeService.redirectToCheckout({ sessionId: data.sessionId });

      } catch (error) {
        debugError('❌ Direct checkout error:', error);
        alert(`Failed to start checkout: ${error.message}`);
      } finally {
        setLoadingPlan(null);
      }
    }
  };

  const features = [
    {
      name: 'Plugins per month',
      free: '3 plugins',
      freelancer: '10 plugins',
      agency: '50 plugins',
      enterprise: 'Unlimited'
    },
    {
      name: 'Team members',
      free: '1 user',
      freelancer: '1 user',
      agency: '5 seats',
      enterprise: 'Unlimited'
    },
    {
      name: 'Support',
      free: 'Community',
      freelancer: 'Email support',
      agency: 'Priority support',
      enterprise: 'Dedicated support'
    },
    {
      name: 'White-label option',
      free: false,
      freelancer: false,
      agency: true,
      enterprise: true
    },
    {
      name: 'API access',
      free: false,
      freelancer: false,
      agency: false,
      enterprise: true
    },
    {
      name: 'Custom branding',
      free: false,
      freelancer: false,
      agency: false,
      enterprise: true
    }
  ];

  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      tokens: '3 plugins/month',
      popular: false,
      description: 'Perfect for trying out the platform',
      buttonText: 'Get Started Free',
      buttonStyle: 'bg-gray-600 hover:bg-gray-700 text-white',
      icon: <Gift className="w-6 h-6" />,
      planType: 'free'
    },
    {
      name: 'Freelancer',
      price: annualBilling ? '$82.50' : '$99',
      period: annualBilling ? 'month (billed annually)' : 'month',
      tokens: '10 plugins/month',
      tokensNote: 'Single user, Email support',
      popular: true,
      description: 'For individual developers and creators',
      buttonText: 'Start Freelancer',
      buttonStyle: 'bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white',
      icon: <Zap className="w-6 h-6" />,
      planType: 'freelancer'
    },
    {
      name: 'Agency',
      price: annualBilling ? '$249.17' : '$299',
      period: annualBilling ? 'month (billed annually)' : 'month',
      tokens: '50 plugins/month',
      tokensNote: '5 team seats, Priority support, White-label',
      popular: false,
      description: 'For teams and agencies',
      buttonText: 'Start Agency',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white',
      icon: <Crown className="w-6 h-6" />,
      planType: 'agency'
    },
    {
      name: 'Enterprise',
      price: annualBilling ? '$665.83' : '$799',
      period: annualBilling ? 'month (billed annually)' : 'month',
      tokens: 'Unlimited plugins',
      tokensNote: 'Unlimited team, API access, Dedicated support',
      popular: false,
      bestValue: true,
      description: 'For large teams and businesses',
      buttonText: 'Start Enterprise',
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white',
      icon: <Crown className="w-6 h-6" />,
      planType: 'enterprise'
    }
  ];

  return (
    <PageContainer>
      <Header 
        onShowFeaturesModal={() => setShowFeaturesModal(true)}
        onShowLoginModal={onShowLoginModal}
      />

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent pb-2">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your WordPress plugin development needs.<br />
            Start free, upgrade anytime.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-lg ${!annualBilling ? 'text-white font-semibold' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                annualBilling ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  annualBilling ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${annualBilling ? 'text-white font-semibold' : 'text-gray-400'}`}>
              Annual
            </span>
            {annualBilling && (
              <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className={`grid grid-cols-1 ${session ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-6 max-w-7xl mx-auto mb-16`}>
          {pricingTiers
            .filter(tier => !(session && tier.name === 'Free'))
            .map((tier, index) => (
            <div
              key={tier.name}
              className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border shadow-2xl transition-all duration-300 hover:transform hover:scale-105 ${
                tier.popular 
                  ? 'border-purple-400 ring-2 ring-purple-400/50' 
                  : 'border-white/20'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              {tier.bestValue && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Best Value!
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    {tier.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-gray-300 mb-4">{tier.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-gray-400 ml-2">/{tier.period}</span>
                </div>
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <p className="text-yellow-400 font-bold text-lg">{tier.tokens}</p>
                  <p className="text-gray-300 text-sm">{tier.tokensNote}</p>
                </div>
                <button
                  onClick={() => handleGetStarted(tier.name, tier.planType)}
                  disabled={loadingPlan === tier.name}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${tier.buttonStyle} transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {loadingPlan === tier.name ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    tier.buttonText
                  )}
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {features.map((feature, featureIndex) => {
                  const tierKey = tier.planType || tier.name.toLowerCase();
                  const featureValue = feature[tierKey];
                  const hasFeature = featureValue === true || (typeof featureValue === 'string' && featureValue !== false);
                  const isPartialFeature = typeof featureValue === 'string' && featureValue !== true;
                  
                  // Special handling for string values - show the value directly instead of feature name
                  const isCreditsFeature = feature.name.includes('credits/month');
                  const displayText = isPartialFeature
                    ? featureValue
                    : feature.name;

                  return (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {hasFeature ? (
                          <span className="text-green-400 text-lg">✅</span>
                        ) : (
                          <span className="text-gray-500 text-lg">❌</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col">
                          <span className={`text-sm ${hasFeature ? 'text-white' : 'text-gray-300'}`}>
                            {displayText}
                          </span>
                        </div>
                        {feature.note && (
                          <p className="text-xs text-gray-400 mt-1">
                            {feature.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Support Info */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm text-gray-400 text-center">
                  {tier.name === 'Max' ? 'Priority support' : 'Community support'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">What counts as a plugin?</h3>
              <p className="text-gray-300 text-sm">
                Each new plugin generation or major revision counts toward your monthly limit. Minor edits and re-downloads don't count.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">Can I upgrade or downgrade anytime?</h3>
              <p className="text-gray-300 text-sm">
                Yes! You can change your plan at any time. Changes take effect immediately with prorated billing.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">Do unused plugins roll over?</h3>
              <p className="text-gray-300 text-sm">
                No, your plugin limit resets each billing period. Enterprise plans have unlimited plugins.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">What's included in annual billing?</h3>
              <p className="text-gray-300 text-sm">
                Annual billing saves you 2 months (about 17% off). You get the same features, just pay less!
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Amazing Plugins?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already creating WordPress plugins with AI. Start free today.
          </p>
          <button
            onClick={() => handleGetStarted('Free')}
            disabled={loadingPlan === 'Free'}
            className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loadingPlan === 'Free' ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                <span>Loading...</span>
              </div>
            ) : (
              'Start Building Now'
            )}
          </button>
        </div>

      <FeaturesModal isOpen={showFeaturesModal} onClose={() => setShowFeaturesModal(false)} />
    </PageContainer>
  );
}

export default PricingPage;