const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());

// Special handling for Stripe webhooks - they need raw body
app.use('/api/stripe-webhook', express.raw({type: 'application/json'}));
app.use(express.json());

// Import API routes
const createCheckoutSession = require('./api/create-checkout-session.js');
const stripeWebhook = require('./api/stripe-webhook.js');
const cancelSubscription = require('./api/cancel-subscription.js');
const downgradeSubscription = require('./api/downgrade-subscription.js');
const reactivateSubscription = require('./api/reactivate-subscription.js');
const syncSubscription = require('./api/sync-subscription.js');
const debugSubscription = require('./api/debug-subscription.js');
const cleanupSubscriptions = require('./api/cleanup-subscriptions.js');
const debugStripe = require('./api/debug-stripe.js');
const fixSubscription = require('./api/fix-subscription.js');

// API routes
app.post('/api/create-checkout-session', createCheckoutSession.default || createCheckoutSession);
app.post('/api/stripe-webhook', stripeWebhook.default || stripeWebhook);
app.post('/api/cancel-subscription', cancelSubscription.default || cancelSubscription);
app.post('/api/downgrade-subscription', downgradeSubscription.default || downgradeSubscription);
app.post('/api/reactivate-subscription', reactivateSubscription.default || reactivateSubscription);
app.post('/api/sync-subscription', syncSubscription.default || syncSubscription);
app.post('/api/debug-subscription', debugSubscription.default || debugSubscription);
app.post('/api/cleanup-subscriptions', cleanupSubscriptions.default || cleanupSubscriptions);
app.post('/api/debug-stripe', debugStripe.default || debugStripe);
app.post('/api/fix-subscription', fixSubscription.default || fixSubscription);

// Debug endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    env: {
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      supabaseKeyStart: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'none'
    }
  });
});

// Test Supabase connection
app.get('/api/test-supabase', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Test query to plans table
    const { data, error } = await supabase
      .from('plans')
      .select('id, name')
      .limit(1);
    
    if (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message,
        hint: error.hint,
        details: error.details
      });
    } else {
      res.json({ 
        success: true, 
        message: 'Supabase connection successful',
        sampleData: data
      });
    }
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Serve static files from React build (both production and development)
app.use(express.static(path.join(__dirname, 'build')));

// For development, proxy non-API routes to React dev server
if (process.env.NODE_ENV !== 'production') {
  app.get('*', (req, res) => {
    // For non-API routes, redirect to React dev server
    if (!req.path.startsWith('/api')) {
      res.redirect(`http://localhost:3000${req.path}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`);
    }
  });
} else {
  // In production, serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});