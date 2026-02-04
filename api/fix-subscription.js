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

    console.log('🔧 Fixing subscription for user:', userId);

    // Based on the debug data, we know:
    // - Database has sub_1Rs162LkI17DtQuzmB4cJbUL as active (but this may not be the real active one in Stripe)
    // - Stripe shows sub_1Rs2AnLkI17DtQuzLyJMeQcq as active
    // - We need to switch which subscription is marked as active
    
    const correctStripeSubId = 'sub_1Rs2AnLkI17DtQuzLyJMeQcq';
    const incorrectStripeSubId = 'sub_1Rs162LkI17DtQuzmB4cJbUL';

    // First, find both subscription records
    const { data: correctSub, error: correctError } = await supabase
      .from('user_subscriptions')
      .select('id, status, plans(name)')
      .eq('stripe_subscription_id', correctStripeSubId)
      .single();

    const { data: incorrectSub, error: incorrectError } = await supabase
      .from('user_subscriptions')
      .select('id, status, plans(name)')
      .eq('stripe_subscription_id', incorrectStripeSubId)
      .single();

    if (correctError || incorrectError) {
      throw new Error(`Could not find subscriptions: ${correctError?.message || incorrectError?.message}`);
    }

    console.log('Found subscriptions:', {
      correct: { id: correctSub.id, status: correctSub.status, plan: correctSub.plans?.name },
      incorrect: { id: incorrectSub.id, status: incorrectSub.status, plan: incorrectSub.plans?.name }
    });

    // Deactivate the incorrect subscription
    const { error: deactivateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', incorrectSub.id);

    if (deactivateError) {
      throw deactivateError;
    }

    // Activate the correct subscription  
    const { error: activateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', correctSub.id);

    if (activateError) {
      throw activateError;
    }

    console.log('✅ Fixed subscription status');

    res.status(200).json({
      success: true,
      message: 'Subscription fixed successfully',
      actions: [
        `Activated subscription ${correctSub.id} (${correctSub.plans?.name}) with Stripe ID ${correctStripeSubId}`,
        `Deactivated subscription ${incorrectSub.id} (${incorrectSub.plans?.name}) with Stripe ID ${incorrectStripeSubId}`
      ]
    });

  } catch (error) {
    console.error('❌ Fix error:', error);
    res.status(500).json({ 
      error: 'Fix failed', 
      details: error.message 
    });
  }
}

module.exports = handler;