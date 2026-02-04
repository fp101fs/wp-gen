// Debug script to run in browser console
// This will help us see what's going wrong with the token system

console.log('🔍 Debugging Token System Issue...');

// Check if user is logged in
const checkAuth = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('🔐 Current user:', user);
    if (error) console.error('Auth error:', error);
    return user;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
};

// Test the database function directly
const testDatabaseFunction = async (userId) => {
  console.log('🧪 Testing get_user_token_info with userId:', userId);
  
  try {
    // Try the current parameter name
    const { data, error } = await supabase.rpc('get_user_token_info', {
      p_user_id: userId
    });
    
    console.log('✅ Database function result:', { data, error });
    return { data, error };
  } catch (error) {
    console.error('❌ Database function failed:', error);
    return { data: null, error };
  }
};

// Test the token API wrapper
const testTokenAPI = async (userId) => {
  console.log('🧪 Testing tokenApi.getUserTokenInfo...');
  
  try {
    const result = await tokenApi.getUserTokenInfo(userId);
    console.log('✅ TokenAPI result:', result);
    return result;
  } catch (error) {
    console.error('❌ TokenAPI failed:', error);
    return { data: null, error };
  }
};

// Run all tests
const runDiagnostics = async () => {
  console.log('🚀 Starting diagnostics...');
  
  const user = await checkAuth();
  if (!user) {
    console.error('❌ No user logged in');
    return;
  }
  
  console.log('👤 User ID:', user.id);
  
  // Test database function directly
  await testDatabaseFunction(user.id);
  
  // Test through token API
  await testTokenAPI(user.id);
  
  console.log('🏁 Diagnostics complete');
};

// Export to window for easy access
window.debugTokens = runDiagnostics;

console.log('💡 Run: debugTokens() to start diagnostics');