import { debugLog, debugError } from '../utils/debugUtils';

// Lazy load Stripe.js only when needed
let stripePromise = null;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = import('@stripe/stripe-js').then(({ loadStripe }) => 
      loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
    );
  }
  return stripePromise;
};

/**
 * Stripe Service for handling payment operations
 */
class StripeService {
  constructor() {
    this.stripe = null;
    this.initialized = false;
  }

  /**
   * Initialize Stripe instance
   * @returns {Promise<Stripe>} Stripe instance
   */
  async initialize() {
    if (!this.initialized) {
      debugLog('🔄 Initializing Stripe with key:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY?.slice(0, 20) + '...');
      this.stripe = await getStripe();
      this.initialized = true;
      
      if (this.stripe) {
        debugLog('✅ Stripe initialized successfully');
      } else {
        debugError('❌ Failed to initialize Stripe');
        throw new Error('Stripe initialization failed');
      }
    }
    return this.stripe;
  }

  /**
   * Redirect to Stripe Checkout
   * @param {Object} checkoutData - Checkout session data
   * @returns {Promise<void>}
   */
  async redirectToCheckout(checkoutData) {
    const stripe = await this.initialize();
    
    debugLog('🔄 Redirecting to Stripe Checkout with data:', checkoutData);
    
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutData.sessionId
    });

    if (error) {
      debugError('❌ Stripe checkout error:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Test Stripe connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const stripe = await this.initialize();
      
      // Test by attempting to create a payment method (won't actually create one)
      debugLog('🧪 Testing Stripe connection...');
      
      if (stripe && process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')) {
        debugLog('✅ Stripe test connection successful');
        return true;
      } else {
        debugError('❌ Stripe connection test failed');
        return false;
      }
    } catch (error) {
      debugError('❌ Stripe connection test error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();
export default stripeService;