const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Reactivate Subscription Endpoint
 * Handles reactivation of canceled subscriptions
 */
async function handler(req, res) {
  console.log('🎯 REACTIVATE SUBSCRIPTION CALLED:', {
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

    console.log('🔄 Reactivating subscription:', subscriptionId);

    // Get current subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Check if subscription is eligible for reactivation
    if (!subscription.cancel_at_period_end) {
      return res.status(400).json({ 
        error: 'Subscription is not scheduled for cancellation',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end
        }
      });
    }

    // Check if subscription is still active (not yet canceled)
    if (subscription.status !== 'active') {
      return res.status(400).json({ 
        error: 'Subscription is not active and cannot be reactivated',
        subscription: {
          id: subscription.id,
          status: subscription.status
        }
      });
    }

    // Reactivate the subscription by removing the cancellation
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    console.log('✅ Stripe subscription reactivated:', updatedSubscription.id);

    // Update the subscription in our database
    const { error: dbError } = await supabase
      .from('user_subscriptions')
      .update({
        cancel_at_period_end: false,
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
      message: 'Subscription reactivated successfully',
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
        current_period_end: updatedSubscription.current_period_end
      }
    });

  } catch (error) {
    console.error('❌ Reactivate subscription error:', error);
    res.status(500).json({ 
      error: 'Failed to reactivate subscription', 
      details: error.message 
    });
  }
}

module.exports = handler;