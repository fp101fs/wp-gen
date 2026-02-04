/**
 * Token System Manual Testing Script
 * 
 * This script provides helper functions for testing the token system manually
 * Run this in the browser console for quick token system testing
 */

// Test Database Functions Directly
window.testTokenSystem = {
  
  // Test 1: Check user token balance
  async checkBalance(userId = null) {
    console.log('🧪 Testing token balance check...');
    try {
      const { supabase } = await import('../supabaseClient');
      
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      
      if (!userId) {
        console.error('❌ No user ID provided or user not logged in');
        return;
      }

      const { data, error } = await supabase
        .rpc('get_user_token_info', { p_user_id: userId });

      if (error) {
        console.error('❌ Database error:', error);
        return;
      }

      console.log('✅ Token balance check successful:', data);
      return data;
    } catch (error) {
      console.error('❌ Token balance test failed:', error);
    }
  },

  // Test 2: Test token deduction
  async testDeduction(userId = null, amount = 1, description = 'Test deduction') {
    console.log('🧪 Testing token deduction...');
    try {
      const { supabase } = await import('../supabaseClient');
      
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      
      if (!userId) {
        console.error('❌ No user ID provided or user not logged in');
        return;
      }

      // Check balance before
      const balanceBefore = await this.checkBalance(userId);
      console.log('📊 Balance before:', balanceBefore);

      // Attempt deduction
      const { data, error } = await supabase
        .rpc('deduct_tokens', {
          p_user_id: userId,
          p_amount: amount,
          p_description: description,
          p_extension_id: null
        });

      if (error) {
        console.error('❌ Deduction error:', error);
        return;
      }

      console.log('✅ Token deduction successful:', data);
      
      // Check balance after
      const balanceAfter = await this.checkBalance(userId);
      console.log('📊 Balance after:', balanceAfter);
      
      return data;
    } catch (error) {
      console.error('❌ Token deduction test failed:', error);
    }
  },

  // Test 3: Test token addition
  async testAddition(userId = null, amount = 5, type = 'manual', description = 'Test addition') {
    console.log('🧪 Testing token addition...');
    try {
      const { supabase } = await import('../supabaseClient');
      
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      
      if (!userId) {
        console.error('❌ No user ID provided or user not logged in');
        return;
      }

      // Check balance before
      const balanceBefore = await this.checkBalance(userId);
      console.log('📊 Balance before:', balanceBefore);

      // Attempt addition
      const { data, error } = await supabase
        .rpc('add_tokens', {
          p_user_id: userId,
          p_amount: amount,
          p_type: type,
          p_description: description,
          p_subscription_id: null
        });

      if (error) {
        console.error('❌ Addition error:', error);
        return;
      }

      console.log('✅ Token addition successful:', data);
      
      // Check balance after
      const balanceAfter = await this.checkBalance(userId);
      console.log('📊 Balance after:', balanceAfter);
      
      return data;
    } catch (error) {
      console.error('❌ Token addition test failed:', error);
    }
  },

  // Test 4: Test plan service functions
  async testPlanService(userId = null) {
    console.log('🧪 Testing plan service...');
    try {
      const { planService } = await import('../services/PlanService');
      
      if (!userId) {
        const { supabase } = await import('../supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      
      if (!userId) {
        console.error('❌ No user ID provided or user not logged in');
        return;
      }

      // Test user type detection
      const userType = await planService.getUserType(userId);
      console.log('✅ User type:', userType);

      // Test permission checking
      const canGenerate = await planService.canUserPerformAction(userId, 'generate_extension');
      console.log('✅ Can generate extension:', canGenerate);

      // Test plan configuration
      const allPlans = planService.getAllPlans();
      console.log('✅ All plans:', allPlans);

      return {
        userType,
        canGenerate,
        allPlans
      };
    } catch (error) {
      console.error('❌ Plan service test failed:', error);
    }
  },

  // Test 5: Test token service
  async testTokenService(userId = null) {
    console.log('🧪 Testing token service...');
    try {
      const { tokenService } = await import('../services/TokenService');
      
      if (!userId) {
        const { supabase } = await import('../supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      
      if (!userId) {
        console.error('❌ No user ID provided or user not logged in');
        return;
      }

      // Test balance check
      const balance = await tokenService.checkTokenBalance(userId);
      console.log('✅ Token balance check:', balance);

      // Test user plan details
      const planDetails = await tokenService.getUserPlanDetails(userId);
      console.log('✅ User plan details:', planDetails);

      return {
        balance,
        planDetails
      };
    } catch (error) {
      console.error('❌ Token service test failed:', error);
    }
  },

  // Test 6: Full integration test
  async runFullTest(userId = null) {
    console.log('🚀 Running full integration test...');
    
    const results = {
      balance: null,
      planService: null,
      tokenService: null,
      deduction: null,
      addition: null
    };

    try {
      // Get user ID if not provided
      if (!userId) {
        const { supabase } = await import('../supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      
      if (!userId) {
        console.error('❌ No user logged in');
        return results;
      }

      console.log('👤 Testing with user ID:', userId);

      // Test 1: Check initial balance
      results.balance = await this.checkBalance(userId);
      
      // Test 2: Test plan service
      results.planService = await this.testPlanService(userId);
      
      // Test 3: Test token service
      results.tokenService = await this.testTokenService(userId);
      
      // Test 4: Test token addition (add 1 token)
      results.addition = await this.testAddition(userId, 1, 'test', 'Integration test addition');
      
      // Test 5: Test token deduction (use 1 token)
      results.deduction = await this.testDeduction(userId, 1, 'Integration test deduction');

      console.log('🎉 Full integration test completed!');
      console.log('📋 Final Results:', results);
      
      return results;
    } catch (error) {
      console.error('❌ Full integration test failed:', error);
      return results;
    }
  },

  // Helper: Reset user tokens to a specific amount (for testing)
  async resetTokens(userId = null, amount = 5) {
    console.log(`🔄 Resetting tokens to ${amount}...`);
    try {
      if (!userId) {
        const { supabase } = await import('../supabaseClient');
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      
      if (!userId) {
        console.error('❌ No user ID provided or user not logged in');
        return;
      }

      // Add tokens to get to desired amount
      await this.testAddition(userId, amount, 'reset', 'Token reset for testing');
      
      console.log(`✅ Tokens reset to ${amount}`);
    } catch (error) {
      console.error('❌ Token reset failed:', error);
    }
  }
};

// Auto-run basic test when script loads
console.log('🧪 Token System Test Script Loaded!');
console.log('📝 Available functions:');
console.log('  - testTokenSystem.checkBalance()');
console.log('  - testTokenSystem.testDeduction()');
console.log('  - testTokenSystem.testAddition()');
console.log('  - testTokenSystem.testPlanService()');
console.log('  - testTokenSystem.testTokenService()');
console.log('  - testTokenSystem.runFullTest() - Runs all tests');
console.log('  - testTokenSystem.resetTokens(userId, amount) - Reset tokens for testing');
console.log('');
console.log('💡 Quick start: Run testTokenSystem.runFullTest() to test everything');