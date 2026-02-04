const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create Stripe Checkout Session
 * This API endpoint creates a Stripe checkout session for subscription purchases
 */
async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, customerId, userEmail, billingCycle, planType, couponId } = req.body;

    // Validate required parameters
    if (!priceId || !userEmail) {
      return res.status(400).json({ 
        error: 'Missing required parameters: priceId and userEmail are required' 
      });
    }

    console.log('🔄 Creating checkout session for:', {
      priceId,
      userEmail,
      billingCycle,
      planType,
      couponId: couponId || 'none'
    });

    // Create the checkout session
    const sessionConfig = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      metadata: {
        userId: customerId || '',
        planType: planType || '',
        billingCycle: billingCycle || 'monthly'
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`,
      subscription_data: {
        metadata: {
          userId: customerId || '',
          planType: planType || '',
          billingCycle: billingCycle || 'monthly'
        }
      }
    };

    // Configure discounts vs manual promotion codes
    if (couponId) {
      console.log('🔄 Auto-applying discount, disabling manual promotion codes');
      
      // Since we found the promotion_code API ID, use that
      if (couponId.startsWith('promo_')) {
        sessionConfig.discounts = [{ promotion_code: couponId }];
        console.log('🎯 Configured to auto-apply as promotion code:', couponId);
      } else {
        sessionConfig.discounts = [{ coupon: couponId }];
        console.log('🎯 Configured to auto-apply as direct coupon:', couponId);
      }
    } else if (planType === 'pro') {
      // Pro plans: disable manual codes to prevent 100OFF abuse
      console.log('🔒 Pro plan detected - disabling manual promotion codes to prevent abuse');
      // No allow_promotion_codes = no manual code field
    } else {
      // Max plans and others: allow manual promotion codes
      sessionConfig.allow_promotion_codes = true;
      console.log('🎯 Non-Pro plan, enabling manual promotion codes');
    }

    try {
      const session = await stripe.checkout.sessions.create(sessionConfig);
      console.log('✅ Checkout session created:', session.id);
      
      res.status(200).json({ 
        sessionId: session.id,
        url: session.url
      });
      
    } catch (sessionError) {
      // If direct coupon failed, try as promotion code
      if (couponId && (sessionError.message?.includes('coupon') || sessionError.message?.includes('No such'))) {
        console.log('⚠️ Direct coupon failed, trying as promotion code:', sessionError.message);
        
        try {
          sessionConfig.discounts = [{ promotion_code: couponId }];
          const retrySession = await stripe.checkout.sessions.create(sessionConfig);
          console.log('✅ Checkout session created with promotion code:', retrySession.id);
          
          res.status(200).json({ 
            sessionId: retrySession.id,
            url: retrySession.url
          });
          
        } catch (couponError) {
          console.warn('❌ Both promotion code and coupon failed, creating session without discount');
          
          // Remove discounts and create session with manual codes only
          delete sessionConfig.discounts;
          const finalSession = await stripe.checkout.sessions.create(sessionConfig);
          console.log('✅ Checkout session created without auto-discount:', finalSession.id);
          
          res.status(200).json({ 
            sessionId: finalSession.id,
            url: finalSession.url
          });
        }
      } else {
        // Different error, propagate it
        throw sessionError;
      }
    }

  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    
    // Provide more specific error details for debugging
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message,
      code: error.code,
      type: error.type,
      couponId: req.body.couponId || 'none'
    });
  }
}

module.exports = handler;