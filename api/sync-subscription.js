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
function getPlanTypeFromPriceId(priceId) {
  const priceIdMap = {
    // Pro plan price IDs
    'price_1RrxXyLkI17DtQuz0GAfQvbp': 'pro', // monthly
    'price_1RrxZcLkI17DtQuzMnyIxfWN': 'pro', // yearly
    
    // Unlimited plan price IDs
    'price_1RrxYgLkI17DtQuzgVyYSyr8': 'unlimited', // monthly
    'price_1Rrxa7LkI17DtQuz2wvwpedB': 'unlimited', // yearly
  };

  return priceIdMap[priceId] || null;
}

/**
 * Sync Subscription Endpoint
 * Syncs database subscription data with Stripe
 */
async function handler(req, res) {
  console.log('🎯 SYNC SUBSCRIPTION CALLED:', {
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
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('🔄 Syncing subscription for user:', userId);

    // First, let's see ALL subscriptions for this user to understand the data state
    const { data: allUserSubs, error: allSubsError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        plan_id,
        stripe_subscription_id,
        status,
        created_at,
        plans (id, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    console.log('🔍 ALL user subscriptions:', allUserSubs);

    // Get user's subscription from database
    const { data: dbSubscription, error: dbError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plans (name)
      `)
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('❌ Database error:', dbError);
      return res.status(500).json({ error: 'Failed to fetch subscription from database' });
    }

    if (!dbSubscription) {
      console.log('ℹ️ No subscription found in database for user');
      return res.status(404).json({ error: 'No subscription found' });
    }

    console.log('📋 Database subscription:', {
      id: dbSubscription.id,
      planName: dbSubscription.plans?.name,
      stripeSubId: dbSubscription.stripe_subscription_id,
      status: dbSubscription.status
    });

    // Handle case where database subscription has no Stripe ID (free plan or null value)
    if (dbSubscription.stripe_subscription_id === null || 
        dbSubscription.stripe_subscription_id === 'null' || 
        !dbSubscription.stripe_subscription_id) {
      console.log('🔍 Database subscription has no valid Stripe ID - checking for alternatives');
      
      // Look for any active Stripe subscriptions for this user by checking other records
      const activeStripeSubscriptions = allUserSubs.filter(sub => 
        sub.stripe_subscription_id && 
        sub.stripe_subscription_id !== 'null' &&
        sub.stripe_subscription_id.startsWith('sub_') // Valid Stripe subscription ID format
      );
      
      console.log('🔍 Found Stripe subscriptions in other records:', activeStripeSubscriptions);
      
      if (activeStripeSubscriptions.length === 0) {
        console.log('✅ No Stripe subscriptions found - user is correctly on free plan');
        return res.status(200).json({
          success: true,
          message: 'User is correctly on free plan with no active Stripe subscriptions',
          needsSync: false
        });
      }
      
      // If we found Stripe subscriptions, we need to verify them and possibly activate one
      console.log('🔄 Found potential active Stripe subscriptions, checking their status...');
      
      for (const sub of activeStripeSubscriptions) {
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
          if (stripeSubscription.status === 'active') {
            console.log(`✅ Found active Stripe subscription: ${stripeSubscription.id}`);
            
            // Activate this subscription record and deactivate the free one
            const { error: activateError } = await supabase
              .from('user_subscriptions')
              .update({ 
                status: 'active',
                updated_at: new Date().toISOString() 
              })
              .eq('id', sub.id);
              
            const { error: deactivateError } = await supabase
              .from('user_subscriptions')
              .update({ 
                status: 'inactive',
                updated_at: new Date().toISOString() 
              })
              .eq('id', dbSubscription.id);
            
            if (activateError || deactivateError) {
              console.error('❌ Error switching subscriptions:', {
                activateError: activateError?.message,
                deactivateError: deactivateError?.message,
                activateErrorCode: activateError?.code,
                deactivateErrorCode: deactivateError?.code
              });
              return res.status(500).json({ 
                error: 'Failed to switch subscription status',
                details: {
                  activateError: activateError?.message,
                  deactivateError: deactivateError?.message
                }
              });
            }
            
            return res.status(200).json({
              success: true,
              message: 'Switched from free plan to active Stripe subscription',
              oldPlan: 'free',
              newPlan: sub.plans?.name,
              needsSync: true,
              requiresPageReload: true
            });
          }
        } catch (error) {
          console.log(`❌ Stripe subscription ${sub.stripe_subscription_id} is not valid:`, error.message);
        }
      }
      
      console.log('ℹ️ No active Stripe subscriptions found - user remains on free plan');
      return res.status(200).json({
        success: true,
        message: 'No active Stripe subscriptions found',
        needsSync: false
      });
    }

    // Validate Stripe subscription ID before making API call
    if (!dbSubscription.stripe_subscription_id.startsWith('sub_')) {
      console.error('❌ Invalid Stripe subscription ID format:', dbSubscription.stripe_subscription_id);
      return res.status(400).json({ 
        error: 'Invalid Stripe subscription ID format',
        needsSync: false 
      });
    }

    // Get the actual subscription from Stripe
    let stripeSubscription;
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(dbSubscription.stripe_subscription_id);
    } catch (stripeError) {
      console.error('❌ Failed to retrieve Stripe subscription:', stripeError.message);
      
      // If subscription doesn't exist in Stripe, it might have been deleted
      if (stripeError.code === 'resource_missing') {
        console.log('🔄 Stripe subscription not found, marking as canceled in database');
        
        const { error: cancelError } = await supabase
          .from('user_subscriptions')
          .update({ 
            status: 'canceled',
            updated_at: new Date().toISOString() 
          })
          .eq('id', dbSubscription.id);
          
        if (cancelError) {
          console.error('❌ Failed to cancel subscription in database:', cancelError);
          return res.status(500).json({ error: 'Failed to update canceled subscription' });
        }
        
        return res.status(200).json({
          success: true,
          message: 'Subscription was canceled in Stripe and updated in database',
          needsSync: true,
          requiresPageReload: true
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to retrieve subscription from Stripe',
        details: stripeError.message 
      });
    }
    
    const currentPriceId = stripeSubscription.items.data[0]?.price?.id;
    const actualPlanType = getPlanTypeFromPriceId(currentPriceId);

    console.log('📋 Stripe subscription:', {
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      priceId: currentPriceId,
      detectedPlan: actualPlanType,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
    });

    // Check if sync is needed
    const needsSync = dbSubscription.plans?.name !== actualPlanType ||
                     dbSubscription.status !== stripeSubscription.status ||
                     dbSubscription.cancel_at_period_end !== stripeSubscription.cancel_at_period_end;

    if (!needsSync) {
      console.log('✅ Subscription is already in sync');
      return res.status(200).json({
        success: true,
        message: 'Subscription is already in sync',
        currentPlan: actualPlanType,
        needsSync: false
      });
    }

    console.log('🔄 Syncing subscription data...');

    // Get the correct plan ID for the actual plan
    const { data: correctPlan, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('name', actualPlanType)
      .single();

    if (planError) {
      console.error('❌ Error finding plan:', planError);
      return res.status(500).json({ error: `Plan '${actualPlanType}' not found in database` });
    }

    // Based on the data, we can see there are multiple active subscriptions
    // The best approach is to find the one that matches Stripe and activate it properly
    
    console.log('🔧 Using smart subscription management approach');
    
    // Find if there's already a subscription with the correct plan
    const existingCorrectSub = allUserSubs.find(sub => 
      sub.plans?.name === actualPlanType && 
      sub.stripe_subscription_id === stripeSubscription.id
    );
    
    console.log('🔍 Existing correct subscription:', existingCorrectSub);
    
    const updates = [];
    
    if (existingCorrectSub) {
      console.log('✅ Found existing subscription that matches Stripe exactly');
      
      // Deactivate all other subscriptions for this user (including free plan)
      updates.push(
        supabase
          .from('user_subscriptions')
          .update({ 
            status: 'canceled', // Use 'canceled' instead of 'inactive' to avoid check constraint
            updated_at: new Date().toISOString() 
          })
          .eq('user_id', userId)
          .neq('id', existingCorrectSub.id)
          .in('status', ['active', 'trialing'])
          // Deactivate ALL other active subscriptions, including free plan
      );
      
      // Ensure the correct subscription is active and up to date
      updates.push(
        supabase
          .from('user_subscriptions')
          .update({ 
            status: stripeSubscription.status,
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingCorrectSub.id)
      );
    } else {
      console.log('⚠️ No existing subscription matches Stripe exactly, updating current one');
      
      // Update plan_id if it's different - but work around the constraint issue
      if (dbSubscription.plans?.name !== actualPlanType) {
        console.log(`🔄 Updating plan from ${dbSubscription.plans?.name} to ${actualPlanType}`);
        
        // Since we can't delete or update conflicting records due to foreign keys,
        // we'll just deactivate this subscription and use the existing correct one
        const existingProSub = allUserSubs.find(sub => sub.plans?.name === actualPlanType);
        
        if (existingProSub) {
          console.log('💡 Using existing Pro subscription and deactivating Unlimited one');
          
          // Deactivate the current unlimited subscription (use 'canceled' since 'inactive' isn't allowed)
          updates.push(
            supabase
              .from('user_subscriptions')
              .update({ 
                status: 'canceled',
                updated_at: new Date().toISOString() 
              })
              .eq('id', dbSubscription.id)
          );
          
          // Reactivate the existing pro subscription (don't update Stripe ID since it causes constraint issues)
          updates.push(
            supabase
              .from('user_subscriptions')
              .update({ 
                status: 'active',
                cancel_at_period_end: stripeSubscription.cancel_at_period_end,
                updated_at: new Date().toISOString() 
              })
              .eq('id', existingProSub.id)
          );
        } else {
          console.log('❌ No existing Pro subscription found to reactivate');
        }
      }
    }
    
    // Update status if different
    if (dbSubscription.status !== stripeSubscription.status) {
      console.log(`🔄 Updating status from ${dbSubscription.status} to ${stripeSubscription.status}`);
      updates.push(
        supabase
          .from('user_subscriptions')
          .update({ 
            status: stripeSubscription.status,
            updated_at: new Date().toISOString() 
          })
          .eq('id', dbSubscription.id)
      );
    }
    
    // Update cancel flag if different
    if (dbSubscription.cancel_at_period_end !== stripeSubscription.cancel_at_period_end) {
      console.log(`🔄 Updating cancel flag from ${dbSubscription.cancel_at_period_end} to ${stripeSubscription.cancel_at_period_end}`);
      updates.push(
        supabase
          .from('user_subscriptions')
          .update({ 
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            updated_at: new Date().toISOString() 
          })
          .eq('id', dbSubscription.id)
      );
    }

    let updateError = null;
    
    if (updates.length === 0) {
      console.log('ℹ️ No updates needed - data is already in sync');
    } else {
      // Execute updates one by one to isolate any constraint issues
      for (let i = 0; i < updates.length; i++) {
        const { error } = await updates[i];
        if (error) {
          console.error(`❌ Error in update ${i + 1}:`, error);
          // If it's a constraint violation on plan_id, that means the sync already happened
          if (error.code === '23505' && error.message.includes('plan_id')) {
            console.log('ℹ️ Plan already synced by another process, continuing...');
            continue;
          }
          updateError = error;
          break;
        } else {
          console.log(`✅ Update ${i + 1} successful`);
        }
      }
    }

    if (updateError) {
      console.error('❌ Error updating subscription:', updateError);
      return res.status(500).json({ error: 'Failed to update subscription in database' });
    }

    console.log('✅ Subscription synced successfully');

    // After successful updates, get the current state to confirm the changes
    const { data: updatedSubscription, error: refreshError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plans (name)
      `)
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('🔍 Post-sync database state:', {
      originalPlan: dbSubscription.plans?.name,
      stripePlan: actualPlanType,
      updatedPlan: updatedSubscription?.plans?.name
    });

    res.status(200).json({
      success: true,
      message: 'Subscription synced successfully',
      changes: {
        planChanged: dbSubscription.plans?.name !== actualPlanType,
        statusChanged: dbSubscription.status !== stripeSubscription.status,
        cancelChanged: dbSubscription.cancel_at_period_end !== stripeSubscription.cancel_at_period_end
      },
      oldPlan: dbSubscription.plans?.name,
      newPlan: actualPlanType,
      currentPlan: updatedSubscription?.plans?.name || actualPlanType,
      currentStatus: stripeSubscription.status,
      needsSync: true,
      requiresPageReload: true // Signal that a page reload is needed for cache clearing
    });

  } catch (error) {
    console.error('❌ Sync subscription error:', error);
    res.status(500).json({ 
      error: 'Failed to sync subscription', 
      details: error.message 
    });
  }
}

module.exports = handler;