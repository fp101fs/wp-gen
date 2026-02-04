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

    // Get all subscriptions for this user
    const { data: allSubs, error } = await supabase
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

    if (error) {
      throw error;
    }

    // Get the active subscription
    const activeSub = allSubs.find(sub => sub.status === 'active');

    res.status(200).json({
      success: true,
      allSubscriptions: allSubs,
      activeSubscription: activeSub,
      debug: {
        activeSubStripeId: activeSub?.stripe_subscription_id,
        stripeIdType: typeof activeSub?.stripe_subscription_id,
        stripeIdIsNull: activeSub?.stripe_subscription_id === null,
        stripeIdIsStringNull: activeSub?.stripe_subscription_id === 'null',
        stripeIdLength: activeSub?.stripe_subscription_id?.length
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ 
      error: 'Debug failed', 
      details: error.message 
    });
  }
}

module.exports = handler;