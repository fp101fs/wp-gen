const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Cancel Subscription Endpoint
 * Handles subscription cancellation at period end
 */
async function handler(req, res) {
  console.log('🎯 CANCEL SUBSCRIPTION CALLED:', {
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
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    console.log('🔄 Canceling subscription:', subscriptionId);

    // Update the subscription in Stripe to cancel at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    console.log('✅ Stripe subscription updated:', subscription.id, 'cancel_at_period_end:', subscription.cancel_at_period_end);

    // Update the subscription in our database
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

    console.log('✅ Database updated successfully');

    res.status(200).json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
      cancelAt: subscription.current_period_end,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: subscription.current_period_end
      }
    });

  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel subscription', 
      details: error.message 
    });
  }
}

module.exports = handler;