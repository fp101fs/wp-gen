const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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

    console.log('🔍 Debugging Stripe subscriptions for user:', userId);

    // Get all database subscriptions for this user
    const { data: dbSubs, error: dbError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        stripe_subscription_id,
        status,
        created_at,
        plans (name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (dbError) {
      throw dbError;
    }

    console.log('📋 Database subscriptions:', dbSubs);

    // Get all Stripe subscriptions for this user
    const stripeSubscriptions = [];
    const stripeErrors = [];

    for (const dbSub of dbSubs) {
      if (dbSub.stripe_subscription_id) {
        try {
          const stripeSub = await stripe.subscriptions.retrieve(dbSub.stripe_subscription_id);
          stripeSubscriptions.push({
            database_id: dbSub.id,
            database_plan: dbSub.plans?.name,
            database_status: dbSub.status,
            stripe_id: stripeSub.id,
            stripe_status: stripeSub.status,
            stripe_price_id: stripeSub.items.data[0]?.price?.id,
            created: stripeSub.created,
            current_period_start: stripeSub.current_period_start,
            current_period_end: stripeSub.current_period_end,
            cancel_at_period_end: stripeSub.cancel_at_period_end,
            customer: stripeSub.customer
          });
        } catch (error) {
          stripeErrors.push({
            database_id: dbSub.id,
            stripe_id: dbSub.stripe_subscription_id,
            error: error.message
          });
        }
      }
    }

    // Also try to find any Stripe subscriptions that might not be in our database
    // by searching for the customer
    let allCustomerSubscriptions = [];
    if (stripeSubscriptions.length > 0) {
      const customerId = stripeSubscriptions[0].customer;
      console.log('🔍 Searching all subscriptions for customer:', customerId);
      
      try {
        const customerSubs = await stripe.subscriptions.list({
          customer: customerId,
          limit: 100
        });
        
        allCustomerSubscriptions = customerSubs.data.map(sub => ({
          stripe_id: sub.id,
          stripe_status: sub.status,
          stripe_price_id: sub.items.data[0]?.price?.id,
          created: sub.created,
          current_period_start: sub.current_period_start,
          current_period_end: sub.current_period_end,
          cancel_at_period_end: sub.cancel_at_period_end,
          in_database: dbSubs.some(dbSub => dbSub.stripe_subscription_id === sub.id)
        }));
      } catch (error) {
        console.error('❌ Error fetching customer subscriptions:', error);
      }
    }

    // Price ID mappings for reference
    const priceIdMap = {
      'price_1RrxXyLkI17DtQuz0GAfQvbp': 'pro-monthly',
      'price_1RrxZcLkI17DtQuzMnyIxfWN': 'pro-yearly',
      'price_1RrxYgLkI17DtQuzgVyYSyr8': 'unlimited-monthly',
      'price_1Rrxa7LkI17DtQuz2wvwpedB': 'unlimited-yearly',
    };

    res.status(200).json({
      success: true,
      userId,
      database_subscriptions: dbSubs,
      stripe_subscriptions: stripeSubscriptions,
      stripe_errors: stripeErrors,
      all_customer_subscriptions: allCustomerSubscriptions,
      price_id_mappings: priceIdMap,
      analysis: {
        total_db_subscriptions: dbSubs.length,
        total_stripe_subscriptions: stripeSubscriptions.length,
        active_stripe_subscriptions: allCustomerSubscriptions.filter(sub => sub.stripe_status === 'active').length,
        subscriptions_not_in_db: allCustomerSubscriptions.filter(sub => !sub.in_database).length
      }
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ 
      error: 'Debug failed', 
      details: error.message 
    });
  }
}

module.exports = handler;