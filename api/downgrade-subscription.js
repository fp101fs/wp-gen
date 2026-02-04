const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Helper function to determine plan type from Stripe price ID
 */
function getCurrentPlanFromPriceId(priceId) {
  const priceIdMap = {
    // Pro plan price IDs
    'price_1RrxXyLkI17DtQuz0GAfQvbp': 'pro', // monthly
    'price_1RrxZcLkI17DtQuzMnyIxfWN': 'pro', // yearly
    
    // Unlimited plan price IDs
    'price_1RrxYgLkI17DtQuzgVyYSyr8': 'unlimited', // monthly
    'price_1Rrxa7LkI17DtQuz2wvwpedB': 'unlimited', // yearly
  };

  return priceIdMap[priceId] || 'unknown';
}

/**
 * Downgrade Subscription Endpoint
 * Handles subscription plan downgrade at period end
 */
async function handler(req, res) {
  console.log('🎯 DOWNGRADE SUBSCRIPTION CALLED:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscriptionId, targetPlan } = req.body;

    if (!subscriptionId || !targetPlan) {
      return res.status(400).json({ error: 'Subscription ID and target plan are required' });
    }

    console.log('🔄 Downgrading subscription:', subscriptionId, 'to plan:', targetPlan);
    console.log('🔍 Request body analysis:', {
      subscriptionId,
      targetPlan,
      targetPlanType: typeof targetPlan,
      targetPlanLength: targetPlan?.length,
      targetPlanTrimmed: targetPlan?.trim(),
      body: req.body
    });

    // Define plan price IDs
    const planPriceIds = {
      'free': null, // Free plan has no Stripe price
      'pro': {
        monthly: 'price_1RrxXyLkI17DtQuz0GAfQvbp',
        yearly: 'price_1RrxZcLkI17DtQuzMnyIxfWN'
      },
      'unlimited': {
        monthly: 'price_1RrxYgLkI17DtQuzgVyYSyr8',
        yearly: 'price_1Rrxa7LkI17DtQuz2wvwpedB'
      }
    };

    // If downgrading to free, cancel the subscription
    console.log('🔍 Checking conditions:', {
      isTargetFree: targetPlan === 'free',
      isTargetPro: targetPlan === 'pro',
      targetPlanValue: `"${targetPlan}"`
    });
    
    if (targetPlan === 'free') {
      console.log('🎯 ENTERING FREE CANCELLATION SECTION');
      console.log('🔄 Downgrading to free - canceling subscription');
      
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      // Update database to reflect cancellation
      const { error: dbError } = await supabase
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId);

      if (dbError) {
        console.error('❌ Database update error:', dbError);
        throw new Error('Failed to update subscription in database');
      }

      return res.status(200).json({
        success: true,
        message: 'Subscription will be canceled and downgraded to Free at the end of the current billing period',
        action: 'cancel',
        cancelAt: subscription.current_period_end
      });
    }

    // For Pro plan downgrade, we need to determine the billing cycle
    if (targetPlan === 'pro') {
      console.log('🎯 ENTERING PRO DOWNGRADE SECTION');
      // Get current subscription to determine billing cycle
      const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      const currentPriceId = currentSubscription.items.data[0].price.id;
      
      // Determine current plan from price ID
      const currentPlanFromStripe = getCurrentPlanFromPriceId(currentPriceId);
      console.log('🔍 Plan detection result:', {
        inputPriceId: currentPriceId,
        detectedPlan: currentPlanFromStripe,
        functionReturn: getCurrentPlanFromPriceId(currentPriceId)
      });
      
      console.log('🔍 Current subscription analysis:', {
        currentPriceId,
        currentPlanFromStripe,
        targetPlan,
        subscriptionStatus: currentSubscription.status,
        plansMatch: currentPlanFromStripe === targetPlan
      });

      // Check if already on target plan
      console.log('🔍 Validation check:', {
        currentPlanFromStripe,
        targetPlan,
        areEqual: currentPlanFromStripe === targetPlan,
        currentPlanType: typeof currentPlanFromStripe,
        targetPlanType: typeof targetPlan
      });
      
      if (currentPlanFromStripe === targetPlan) {
        console.log('🚫 BLOCKING: Subscription is already on target plan');
        return res.status(400).json({
          error: `Subscription is already on ${targetPlan} plan`,
          currentPlan: currentPlanFromStripe,
          requestedPlan: targetPlan
        });
      } else {
        console.log('✅ ALLOWING: Plans are different, proceeding with downgrade');
      }

      // Check if downgrade is valid
      if (currentPlanFromStripe === 'pro' && targetPlan === 'unlimited') {
        return res.status(400).json({
          error: 'Cannot downgrade from Pro to Unlimited (that would be an upgrade)',
          currentPlan: currentPlanFromStripe,
          requestedPlan: targetPlan
        });
      }
      
      // Determine if it's monthly or yearly
      const isYearly = currentPriceId.includes('yearly') || 
        currentPriceId === 'price_1Rrxa7LkI17DtQuz2wvwpedB';
      
      const newPriceId = isYearly ? planPriceIds.pro.yearly : planPriceIds.pro.monthly;
      
      // Double-check: if the price IDs are the same, return early
      if (currentPriceId === newPriceId) {
        return res.status(400).json({
          error: `Subscription is already on ${targetPlan} plan (price IDs match)`,
          currentPriceId,
          newPriceId,
          currentPlan: currentPlanFromStripe,
          requestedPlan: targetPlan
        });
      }
      
      console.log('🔄 Scheduling downgrade to Pro plan:', {
        currentPriceId,
        newPriceId,
        isYearly
      });

      // Schedule the plan change for the end of the current period
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: currentSubscription.items.data[0].id,
          price: newPriceId
        }],
        proration_behavior: 'none', // No proration, change at period end
        billing_cycle_anchor: 'unchanged'
      });

      // Just update the timestamp - don't change plan_id until the change actually takes effect
      // The plan change will be handled by webhooks when it actually happens
      const { error: dbError } = await supabase
        .from('user_subscriptions')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId);

      if (dbError) {
        console.error('❌ Database update error:', dbError);
        // For unique constraint violations, this might mean the data is already correct
        if (dbError.code === '23505') {
          console.log('ℹ️ Unique constraint violation - subscription data may already be up to date');
        } else {
          console.log('ℹ️ Could not update subscription timestamp, but Stripe subscription updated successfully');
        }
      }

      return res.status(200).json({
        success: true,
        message: `Subscription will be downgraded to ${targetPlan} at the end of the current billing period`,
        action: 'downgrade',
        targetPlan: targetPlan,
        effectiveDate: subscription.current_period_end
      });
    }

    return res.status(400).json({ error: 'Invalid target plan' });

  } catch (error) {
    console.error('❌ Downgrade subscription error:', error);
    res.status(500).json({ 
      error: 'Failed to downgrade subscription', 
      details: error.message 
    });
  }
}

module.exports = handler;