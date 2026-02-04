const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('🧹 Cleaning up duplicate subscriptions for user:', userId);

    // Get all active subscriptions
    const { data: activeSubscriptions, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        plan_id,
        stripe_subscription_id,
        status,
        plans (id, name)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    console.log('🔍 Found active subscriptions:', activeSubscriptions.map(sub => ({
      id: sub.id,
      plan: sub.plans?.name,
      hasStripe: !!sub.stripe_subscription_id
    })));

    if (activeSubscriptions.length <= 1) {
      return res.status(200).json({
        success: true,
        message: 'No cleanup needed - only one or no active subscriptions',
        activeCount: activeSubscriptions.length
      });
    }

    // Find the best subscription to keep active
    // Priority: 1) Has Stripe ID, 2) Highest tier plan, 3) Most recent
    const priorityOrder = { 'unlimited': 3, 'pro': 2, 'free': 1 };
    
    const bestSubscription = activeSubscriptions.reduce((best, current) => {
      // Prefer subscriptions with Stripe IDs
      if (current.stripe_subscription_id && !best.stripe_subscription_id) {
        return current;
      }
      if (!current.stripe_subscription_id && best.stripe_subscription_id) {
        return best;
      }
      
      // Compare plan tiers
      const currentPriority = priorityOrder[current.plans?.name] || 0;
      const bestPriority = priorityOrder[best.plans?.name] || 0;
      
      if (currentPriority > bestPriority) {
        return current;
      }
      
      return best;
    });

    console.log('🎯 Best subscription to keep:', {
      id: bestSubscription.id,
      plan: bestSubscription.plans?.name,
      hasStripe: !!bestSubscription.stripe_subscription_id
    });

    // Deactivate all other subscriptions
    const subscriptionsToDeactivate = activeSubscriptions.filter(sub => sub.id !== bestSubscription.id);
    
    console.log('🚫 Deactivating subscriptions:', subscriptionsToDeactivate.map(sub => ({
      id: sub.id,
      plan: sub.plans?.name
    })));

    if (subscriptionsToDeactivate.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No duplicates found to cleanup',
        keptSubscription: bestSubscription.plans?.name
      });
    }

    // Deactivate duplicates
    const { error: deactivateError } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString() 
      })
      .in('id', subscriptionsToDeactivate.map(sub => sub.id));

    if (deactivateError) {
      throw deactivateError;
    }

    console.log('✅ Successfully cleaned up duplicate subscriptions');

    res.status(200).json({
      success: true,
      message: 'Successfully cleaned up duplicate subscriptions',
      keptSubscription: bestSubscription.plans?.name,
      deactivatedCount: subscriptionsToDeactivate.length,
      deactivatedPlans: subscriptionsToDeactivate.map(sub => sub.plans?.name)
    });

  } catch (error) {
    console.error('❌ Cleanup error:', error);
    res.status(500).json({ 
      error: 'Cleanup failed', 
      details: error.message 
    });
  }
}

module.exports = handler;