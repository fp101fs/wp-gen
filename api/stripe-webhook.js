const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Configure Next.js to provide raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to read raw body from request stream as Buffer
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Stripe Webhook Handler
 * Handles payment success events and subscription management
 */
async function handler(req, res) {
  console.log('🎯 WEBHOOK CALLED:', {
    method: req.method,
    url: req.url,
    headers: Object.keys(req.headers),
    hasSignature: !!req.headers['stripe-signature'],
    timestamp: new Date().toISOString()
  });

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log('🔑 Webhook config:', {
    hasSignature: !!sig,
    hasSecret: !!endpointSecret,
    secretLength: endpointSecret ? endpointSecret.length : 0,
    secretStart: endpointSecret ? endpointSecret.substring(0, 20) : 'none'
  });

  let event;

  try {
    // Get raw body for signature verification
    const body = await getRawBody(req);
    console.log('📦 Raw body details:', {
      length: body.length,
      type: typeof body,
      isBuffer: Buffer.isBuffer(body),
      firstBytes: body.slice(0, 50).toString('hex')
    });
    
    console.log('🔐 Signature details:', {
      signature: sig,
      signatureLength: sig ? sig.length : 0
    });
    
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log('✅ Webhook signature verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    console.error('❌ Full error:', err);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  try {
    // Handle the event
    console.log('📋 Processing event:', {
      type: event.type,
      id: event.id,
      data: event.data.object.id || 'no-id'
    });

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🎯 Processing checkout.session.completed');
        console.log('📄 Session data:', JSON.stringify(event.data.object, null, 2));
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        console.log('🎯 Processing customer.subscription.created');
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        console.log('🎯 Processing customer.subscription.updated');
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        console.log('🎯 Processing customer.subscription.deleted');
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        console.log('🎯 Processing invoice.payment_succeeded');
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        console.log('🎯 Processing invoice.payment_failed');
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed', details: error.message });
  }
}

/**
 * Handle successful checkout session completion
 */
async function handleCheckoutSessionCompleted(session) {
  console.log('🔄 Processing checkout session:', session.id);

  try {
    const { metadata } = session;
    const userId = metadata?.userId;
    const planType = metadata?.planType;
    const billingCycle = metadata?.billingCycle || 'monthly';

    if (!userId || !planType) {
      console.error('❌ Missing required metadata in checkout session:', { userId, planType });
      return;
    }

    console.log('📋 Checkout session metadata:', { userId, planType, billingCycle });

    // Get the subscription from Stripe if it exists
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      console.log('📄 Retrieved subscription:', subscription.id, 'status:', subscription.status);

      // Check if this subscription has already been processed (to prevent duplicates)
      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (existingSubscription) {
        console.log('ℹ️ Subscription already processed by another webhook - skipping checkout session processing');
        return;
      }

      // Process the subscription
      await processSubscription(subscription, userId, planType, billingCycle);
    } else {
      console.warn('⚠️ No subscription found in checkout session');
    }

  } catch (error) {
    console.error('❌ Error processing checkout session:', error);
    throw error;
  }
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription) {
  console.log('🔄 Processing subscription creation:', subscription.id);
  console.log('📊 Subscription details:', {
    id: subscription.id,
    status: subscription.status,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    metadata: subscription.metadata
  });

  try {
    const { metadata } = subscription;
    const userId = metadata?.userId;
    const planType = metadata?.planType;
    const billingCycle = metadata?.billingCycle || 'monthly';

    if (!userId || !planType) {
      console.error('❌ Missing required metadata in subscription:', { userId, planType });
      return;
    }

    await processSubscription(subscription, userId, planType, billingCycle);

  } catch (error) {
    console.error('❌ Error processing subscription creation:', error);
    throw error;
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Processing subscription update:', subscription.id);
  console.log('📊 Subscription items:', subscription.items);

  try {
    // Detect plan changes by looking at the price ID
    const currentPriceId = subscription.items.data[0]?.price?.id;
    const planType = getPlanTypeFromPriceId(currentPriceId);
    
    console.log('🔍 Detected plan from price ID:', { currentPriceId, planType });

    // Get current subscription data to check if plan changed
    const { data: currentSub } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plans (name)
      `)
      .eq('stripe_subscription_id', subscription.id)
      .single();

    let updateData = {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    };

    // If we detected a plan change, update the plan_id
    if (planType && currentSub && currentSub.plans?.name !== planType) {
      console.log('🔄 Plan change detected:', currentSub.plans?.name, '->', planType);
      
      const newPlanId = await getPlanIdFromDatabase(planType);
      updateData.plan_id = newPlanId;
      
      console.log('✅ Updating subscription with new plan:', planType);
    }

    // Update subscription in database
    const { error } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('❌ Error updating subscription in database:', error);
      throw error;
    }

    console.log('✅ Subscription updated successfully:', subscription.id);

  } catch (error) {
    console.error('❌ Error processing subscription update:', error);
    throw error;
  }
}

/**
 * Get plan type from Stripe price ID
 */
function getPlanTypeFromPriceId(priceId) {
  const priceIdMap = {
    // Freelancer plan price IDs
    'price_1SxSVzLkI17DtQuz6gzXKUWK': 'freelancer', // monthly
    'price_1SxSZfLkI17DtQuzSxLw6p3d': 'freelancer', // yearly

    // Agency plan price IDs
    'price_1SxSc6LkI17DtQuzVwYMUZjJ': 'agency', // monthly
    'price_1SxScuLkI17DtQuzvuL56xT5': 'agency', // yearly

    // Enterprise plan price IDs
    'price_1SxSeWLkI17DtQuzl42dIK3X': 'enterprise', // monthly
    'price_1SxSf8LkI17DtQuzx4nVmb1Y': 'enterprise', // yearly
  };

  return priceIdMap[priceId] || null;
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription) {
  console.log('🔄 Processing subscription deletion:', subscription.id);

  try {
    // Mark subscription as canceled in database
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: true
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('❌ Error canceling subscription in database:', error);
      throw error;
    }

    console.log('✅ Subscription canceled successfully:', subscription.id);

  } catch (error) {
    console.error('❌ Error processing subscription deletion:', error);
    throw error;
  }
}

/**
 * Handle successful invoice payment (for renewals)
 */
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('🔄 Processing successful invoice payment:', invoice.id);

  try {
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      
      // Check if this is a renewal or initial payment
      const { data: dbSubscription } = await supabase
        .from('user_subscriptions')
        .select('id, created_at')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (dbSubscription) {
        // Check if subscription was created more than 5 minutes ago (indicating this is a renewal)
        const subscriptionAge = Date.now() - new Date(dbSubscription.created_at).getTime();
        const fiveMinutes = 5 * 60 * 1000;

        if (subscriptionAge > fiveMinutes && subscription.metadata?.userId && subscription.metadata?.planType) {
          console.log('🔄 This appears to be a subscription renewal - allocating monthly tokens');
          await allocateMonthlyTokens(
            subscription.metadata.userId,
            subscription.metadata.planType,
            dbSubscription.id
          );
        } else {
          console.log('ℹ️ This is an initial payment - tokens already allocated by subscription.created event');
        }
      } else {
        console.log('ℹ️ No database subscription found - this is likely the initial payment, will be handled by subscription.created');
      }
    }

  } catch (error) {
    console.error('❌ Error processing invoice payment:', error);
    throw error;
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice) {
  console.log('🔄 Processing failed invoice payment:', invoice.id);

  try {
    if (invoice.subscription) {
      // Update subscription status to past_due
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', invoice.subscription);

      if (error) {
        console.error('❌ Error updating subscription to past_due:', error);
        throw error;
      }

      console.log('✅ Subscription marked as past_due:', invoice.subscription);
    }

  } catch (error) {
    console.error('❌ Error processing failed invoice payment:', error);
    throw error;
  }
}

// Track processed subscriptions to prevent double processing within same webhook
const processedSubscriptions = new Set();

/**
 * Process subscription and allocate tokens
 */
async function processSubscription(subscription, userId, planType, billingCycle) {
  console.log('🔄 Processing subscription for user:', userId, 'plan:', planType);

  // Prevent double processing within the same webhook call
  const subscriptionKey = `${subscription.id}-${userId}-${planType}`;
  if (processedSubscriptions.has(subscriptionKey)) {
    console.log('ℹ️ Subscription already processed in this webhook call - skipping to prevent duplicates');
    return;
  }
  processedSubscriptions.add(subscriptionKey);
  
  // Clean up old entries periodically (keep only last 100 to prevent memory leaks)
  if (processedSubscriptions.size > 100) {
    const entries = Array.from(processedSubscriptions);
    processedSubscriptions.clear();
    entries.slice(-50).forEach(entry => processedSubscriptions.add(entry));
  }

  try {
    // First, get or create plan ID from database
    const planId = await getPlanIdFromDatabase(planType);

    // Create or update subscription record
    const subscriptionData = {
      user_id: userId,
      plan_id: planId,
      status: subscription.status,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
      current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false
    };

    // Check if subscription already exists
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error checking existing subscription:', fetchError);
      throw fetchError;
    }

    let subscriptionResult;
    if (existingSubscription) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(subscriptionData)
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating subscription:', error);
        throw error;
      }
      subscriptionResult = data;
      console.log('✅ Subscription updated:', subscriptionResult.id);
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([subscriptionData])
        .select()
        .single();

      if (error) {
        // Check if it's a duplicate key error
        if (error.code === '23505') {
          if (error.message.includes('stripe_subscription_id')) {
            console.log('ℹ️ Subscription already exists (race condition between webhooks) - this is normal');
            // Try to fetch the existing subscription
            const { data: existingSub } = await supabase
              .from('user_subscriptions')
              .select('*')
              .eq('stripe_subscription_id', subscription.id)
              .single();
            subscriptionResult = existingSub;
          } else if (error.message.includes('user_id') && error.message.includes('plan_id')) {
            console.log('🔄 User already has this plan - updating existing subscription record instead of creating new one');
            
            // Find the existing subscription for this user/plan combination
            const { data: existingUserPlanSub, error: findError } = await supabase
              .from('user_subscriptions')
              .select('id')
              .eq('user_id', userId)
              .eq('plan_id', planId)
              .single();
              
            if (findError) {
              console.error('❌ Could not find existing user/plan subscription:', findError);
              throw error; // Throw original error
            }
            
            // Update the existing subscription with new Stripe data
            const { data: updatedSub, error: updateError } = await supabase
              .from('user_subscriptions')
              .update({
                ...subscriptionData,
                status: 'active', // Ensure it's marked as active
                updated_at: new Date().toISOString()
              })
              .eq('id', existingUserPlanSub.id)
              .select()
              .single();
              
            if (updateError) {
              console.error('❌ Error updating existing user/plan subscription:', updateError);
              throw updateError;
            }
            
            console.log('✅ Updated existing subscription for user/plan combination:', updatedSub.id);
            subscriptionResult = updatedSub;
            
            // Deactivate any other active subscriptions for this user
            await deactivateOtherUserSubscriptions(userId, updatedSub.id);
          } else {
            console.error('❌ Unknown duplicate key constraint error:', error);
            throw error;
          }
        } else {
          console.error('❌ Error creating subscription:', error);
          throw error;
        }
      } else {
        subscriptionResult = data;
        console.log('✅ Subscription created:', subscriptionResult.id);
        
        // Deactivate any other active subscriptions for this user
        await deactivateOtherUserSubscriptions(userId, data.id);
      }
    }

    // Allocate tokens for the plan (only once per subscription)
    if (subscription.status === 'active' && subscriptionResult) {
      // Check if tokens have already been allocated for this subscription
      const { data: existingTokens } = await supabase
        .from('token_transactions')
        .select('id')
        .eq('subscription_uuid', subscriptionResult.id)
        .eq('transaction_type', 'purchase')
        .limit(1);

      if (!existingTokens || existingTokens.length === 0) {
        console.log('🎫 Allocating initial tokens for subscription:', subscriptionResult.id);
        await allocateTokensForPlan(userId, planType, subscriptionResult.id);
      } else {
        console.log('ℹ️ Tokens already allocated for this subscription - skipping to prevent duplicates');
      }
    }

  } catch (error) {
    console.error('❌ Error processing subscription:', error);
    throw error;
  }
}

/**
 * Get plan ID from database by plan name
 */
async function getPlanIdFromDatabase(planName) {
  const { data, error } = await supabase
    .from('plans')
    .select('id')
    .eq('name', planName)
    .single();

  if (error) {
    console.error('❌ Error fetching plan ID:', error);
    throw error;
  }

  return data.id;
}

/**
 * Allocate tokens for a specific plan
 */
async function allocateTokensForPlan(userId, planType, subscriptionId) {
  console.log('🎫 Allocating tokens for plan:', planType, 'user:', userId);

  try {
    // Define plan configurations (should match PlanService.js)
    const planConfigs = {
      'free': { tokens: parseInt(process.env.REACT_APP_FREE_PLAN_CREDITS) || 5 },
      'pro': { tokens: 150 },
      'unlimited': { tokens: 500 }
    };

    const planConfig = planConfigs[planType];
    if (!planConfig) {
      console.error('❌ Unknown plan type:', planType);
      throw new Error(`Unknown plan type: ${planType}`);
    }

    // All plans now get finite token allocation

    // Add tokens to user's account
    const { data, error } = await supabase.rpc('add_tokens', {
      user_uuid: userId,
      tokens_to_add: planConfig.tokens,
      transaction_type: 'purchase',
      description: `${planType} plan subscription`,
      subscription_uuid: subscriptionId
    });

    if (error) {
      console.error('❌ Error allocating tokens:', error);
      throw error;
    }

    console.log('✅ Tokens allocated successfully:', {
      userId,
      tokensAdded: planConfig.tokens,
      newBalance: data
    });

  } catch (error) {
    console.error('❌ Error in token allocation:', error);
    throw error;
  }
}

/**
 * Allocate monthly tokens for subscription renewals
 */
async function allocateMonthlyTokens(userId, planType, subscriptionId) {
  console.log('🔄 Checking if monthly tokens needed for user:', userId, 'plan:', planType);

  try {
    // Check how many token transactions this subscription already has
    const { data: existingTransactions } = await supabase
      .from('token_transactions')
      .select('id')
      .eq('subscription_uuid', subscriptionId)
      .eq('transaction_type', 'purchase');

    if (existingTransactions && existingTransactions.length > 0) {
      console.log('ℹ️ Tokens already allocated for this subscription - skipping to prevent duplicates');
      return;
    }

    // This is a new subscription or renewal, allocate tokens
    if (planType === 'pro') {
      console.log('🎫 Allocating tokens for subscription:', subscriptionId);
      await allocateTokensForPlan(userId, planType, subscriptionId);
    } else {
      console.log('ℹ️ No token allocation needed for plan:', planType);
    }

  } catch (error) {
    console.error('❌ Error allocating monthly tokens:', error);
    throw error;
  }
}

/**
 * Deactivate all other active subscriptions for a user except the specified one
 */
async function deactivateOtherUserSubscriptions(userId, keepSubscriptionId) {
  console.log('🧹 Deactivating other subscriptions for user:', userId, 'keeping:', keepSubscriptionId);
  
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .neq('id', keepSubscriptionId)
      .in('status', ['active', 'trialing']);
      
    if (error) {
      console.error('❌ Error deactivating other subscriptions:', error);
      throw error;
    }
    
    console.log('✅ Successfully deactivated other subscriptions for user:', userId);
  } catch (error) {
    console.error('❌ Error in deactivateOtherUserSubscriptions:', error);
    throw error;
  }
}

module.exports = handler;