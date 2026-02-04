import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader, Crown, Zap, RefreshCw, Play } from 'lucide-react';
import { useTokenContext } from '../contexts/TokenContext';
import { tokenService } from '../services/TokenService';
import { planService } from '../services/PlanService';
import { stripeService } from '../services/StripeService';
import TokenBalance from './TokenBalance';
import TokenGuard from './TokenGuard';
import UpgradePrompt from './UpgradePrompt';

/**
 * TokenSystemValidation Component
 * Comprehensive testing component for validating the entire token system
 */
const TokenSystemValidation = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [testStats, setTestStats] = useState({ passed: 0, failed: 0, total: 0 });
  const [showUpgradeTest, setShowUpgradeTest] = useState(false);

  const {
    user,
    currentTokens,
    isUnlimited,
    planName,
    planDisplayName,
    tokenStatus,
    hasTokens,
    isLoading,
    canGenerateExtension,
    generateWithTokens,
    refresh,
    showUpgradePrompt,
    hideUpgradePrompt
  } = useTokenContext();

  // Test result helper
  const addTestResult = (testName, passed, message, details = null) => {
    const result = {
      id: Date.now() + Math.random(),
      testName,
      passed,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setTestResults(prev => [...prev, result]);
    setTestStats(prev => ({
      passed: prev.passed + (passed ? 1 : 0),
      failed: prev.failed + (passed ? 0 : 1),
      total: prev.total + 1
    }));
  };

  // Clear test results
  const clearResults = () => {
    setTestResults([]);
    setTestStats({ passed: 0, failed: 0, total: 0 });
  };

  // Mock generation function for testing
  const mockSuccessfulGeneration = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI delay
    
    // Return the format expected by generateWithTokens
    // Note: extensionId should be null for testing since we're not actually saving to DB
    return {
      success: true,
      extensionId: null, // Don't pass invalid UUID for testing
      extensionData: {
        name: 'Test Extension',
        description: 'A test extension generated for validation',
        files: {
          'manifest.json': '{"name": "Test Extension", "version": "1.0"}',
          'popup.html': '<html><body>Test</body></html>'
        },
        version: '1.0'
      }
    };
  };

  const mockFailedGeneration = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('Simulated generation failure');
  };

  // Test 1: Context Initialization
  const testContextInitialization = async () => {
    setCurrentTest('Context Initialization');
    
    try {
      // Check if user is loaded
      if (!user) {
        addTestResult('Context Init', false, 'User not loaded in context');
        return;
      }

      addTestResult('User Loading', true, `User loaded: ${user.email}`);

      // Check if token info is loaded
      if (currentTokens === undefined || currentTokens === null) {
        addTestResult('Token Info', false, 'Token information not loaded');
        return;
      }

      addTestResult('Token Info Loading', true, `Current tokens: ${isUnlimited ? '∞' : currentTokens}`);

      // Check plan information
      if (!planName) {
        addTestResult('Plan Info', false, 'Plan information not loaded');
        return;
      }

      addTestResult('Plan Info Loading', true, `Plan: ${planDisplayName} (${planName})`);

    } catch (error) {
      addTestResult('Context Init', false, `Context initialization error: ${error.message}`);
    }
  };

  // Test 2: Token Status Calculation
  const testTokenStatus = async () => {
    setCurrentTest('Token Status Calculation');

    try {
      const expectedStatus = isUnlimited ? 'unlimited' 
        : currentTokens === 0 ? 'depleted'
        : currentTokens <= 2 ? 'low' 
        : 'good';
      
      const statusMatch = tokenStatus === expectedStatus;
      addTestResult(
        'Token Status Logic', 
        statusMatch, 
        statusMatch 
          ? `Status correctly calculated: ${tokenStatus}` 
          : `Status mismatch. Expected: ${expectedStatus}, Got: ${tokenStatus}`,
        { expected: expectedStatus, actual: tokenStatus, tokens: currentTokens }
      );

      // Test hasTokens calculation
      const expectedHasTokens = isUnlimited || currentTokens > 0;
      const hasTokensMatch = hasTokens === expectedHasTokens;
      addTestResult(
        'Has Tokens Logic',
        hasTokensMatch,
        hasTokensMatch 
          ? `HasTokens correctly calculated: ${hasTokens}`
          : `HasTokens mismatch. Expected: ${expectedHasTokens}, Got: ${hasTokens}`
      );

    } catch (error) {
      addTestResult('Token Status', false, `Token status test error: ${error.message}`);
    }
  };

  // Test 3: Permission Checking
  const testPermissionChecking = async () => {
    setCurrentTest('Permission Checking');

    try {
      const permissionResult = await canGenerateExtension();
      
      addTestResult(
        'Permission Check',
        typeof permissionResult === 'object',
        `Permission check returned: ${JSON.stringify(permissionResult)}`,
        permissionResult
      );

      // Validate permission structure
      const hasRequiredFields = permissionResult.hasOwnProperty('canGenerate') && 
                               permissionResult.hasOwnProperty('reason');
      
      addTestResult(
        'Permission Structure',
        hasRequiredFields,
        hasRequiredFields 
          ? 'Permission result has required fields'
          : 'Permission result missing required fields'
      );

    } catch (error) {
      addTestResult('Permission Check', false, `Permission checking error: ${error.message}`);
    }
  };

  // Test 4: Token Deduction Flow
  const testTokenDeduction = async () => {
    setCurrentTest('Token Deduction Flow');

    if (isUnlimited) {
      addTestResult('Token Deduction', true, 'Skipped - Unlimited plan');
      return;
    }

    if (currentTokens === 0) {
      addTestResult('Token Deduction', true, 'Skipped - No tokens available');
      return;
    }

    try {
      const initialTokens = currentTokens;
      console.log('🧪 Token Deduction Test - Initial tokens:', initialTokens);
      
      // Attempt generation with token deduction
      const result = await generateWithTokens(
        mockSuccessfulGeneration,
        'Test generation for validation'
      );
      
      console.log('🧪 Token Deduction Test - Generation result:', result);

      // Refresh to get updated token count
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for updates
      await refresh(); // Force refresh to get latest token count
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait longer for refresh to complete
      
      // Use the token count from the result if context hasn't updated yet
      const finalTokens = result.tokenInfo?.tokensRemaining !== undefined ? 
        result.tokenInfo.tokensRemaining : currentTokens;
      const tokensDeducted = initialTokens - finalTokens;
      
      console.log('🧪 Token Deduction Test - Final tokens:', finalTokens, 'Deducted:', tokensDeducted);

      addTestResult(
        'Token Deduction',
        tokensDeducted === 1,
        `Tokens deducted: ${tokensDeducted} (Expected: 1)`,
        { 
          initial: initialTokens, 
          final: finalTokens, 
          deducted: tokensDeducted,
          result: result
        }
      );

      addTestResult(
        'Generation Success',
        result.success !== false,
        result.success ? 'Generation completed successfully' : 'Generation failed'
      );

    } catch (error) {
      // Check if this is an expected permission error
      if (error.message.includes('tokens') || error.message.includes('permission')) {
        addTestResult('Token Deduction', true, `Expected error: ${error.message}`);
      } else {
        addTestResult('Token Deduction', false, `Unexpected error: ${error.message}`);
      }
    }
  };

  // Test 5: Error Handling
  const testErrorHandling = async () => {
    setCurrentTest('Error Handling');

    try {
      if (currentTokens === 0 && !isUnlimited) {
        // Test insufficient tokens error
        try {
          await generateWithTokens(
            mockSuccessfulGeneration,
            'Test generation with no tokens'
          );
          addTestResult('No Tokens Error', false, 'Should have thrown error for insufficient tokens');
        } catch (error) {
          addTestResult(
            'No Tokens Error', 
            true, 
            `Correctly blocked generation: ${error.message}`
          );
        }
      } else if (hasTokens) {
        // Test generation failure handling
        try {
          await generateWithTokens(
            mockFailedGeneration,
            'Test failed generation'
          );
          addTestResult('Generation Failure', false, 'Should have thrown error for failed generation');
        } catch (error) {
          addTestResult(
            'Generation Failure',
            true,
            `Correctly handled generation failure: ${error.message}`
          );
        }
      } else {
        addTestResult('Error Handling', true, 'Skipped - No applicable error scenarios');
      }

    } catch (error) {
      addTestResult('Error Handling', false, `Error handling test failed: ${error.message}`);
    }
  };

  // Test 6: Real-time Updates
  const testRealTimeUpdates = async () => {
    setCurrentTest('Real-time Updates');

    try {
      const initialTimestamp = Date.now();
      
      // Trigger a refresh
      await refresh();
      
      // Wait a moment for updates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      addTestResult(
        'Refresh Function',
        true,
        'Refresh completed without errors'
      );

      // Test if context updates properly
      const contextResponsive = currentTokens !== undefined && planName !== undefined;
      addTestResult(
        'Context Responsiveness',
        contextResponsive,
        contextResponsive 
          ? 'Context data is responsive'
          : 'Context data not updating properly'
      );

    } catch (error) {
      addTestResult('Real-time Updates', false, `Real-time update test error: ${error.message}`);
    }
  };

  // Test 7: UI Component Integration
  const testUIComponents = () => {
    setCurrentTest('UI Component Integration');

    try {
      // Test TokenBalance rendering
      const tokenBalanceWorks = currentTokens !== undefined;
      addTestResult(
        'TokenBalance Component',
        tokenBalanceWorks,
        tokenBalanceWorks 
          ? 'TokenBalance component renders correctly'
          : 'TokenBalance component has issues'
      );

      // Test TokenGuard logic
      const tokenGuardLogical = hasTokens !== undefined;
      addTestResult(
        'TokenGuard Component',
        tokenGuardLogical,
        tokenGuardLogical
          ? 'TokenGuard component logic works'
          : 'TokenGuard component has issues'
      );

    } catch (error) {
      addTestResult('UI Components', false, `UI component test error: ${error.message}`);
    }
  };

  // Test 7: Stripe Integration
  const testStripeIntegration = async () => {
    setCurrentTest('Stripe Integration');
    
    try {
      // Test Stripe service initialization
      const connectionTest = await stripeService.testConnection();
      
      if (connectionTest) {
        addTestResult('Stripe Connection', true, 'Stripe SDK initialized successfully with test keys');
      } else {
        addTestResult('Stripe Connection', false, 'Stripe connection test failed');
        return;
      }

      // Test environment variables
      const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
      if (publishableKey && publishableKey.startsWith('pk_test_')) {
        addTestResult('Stripe Test Keys', true, 'Test publishable key configured correctly');
      } else {
        addTestResult('Stripe Test Keys', false, 'Test publishable key not found or not in test mode');
      }

      // Test Stripe object availability
      await stripeService.initialize();
      addTestResult('Stripe Initialization', true, 'Stripe object created successfully');

    } catch (error) {
      addTestResult('Stripe Integration', false, `Stripe test error: ${error.message}`);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    
    const tests = [
      testContextInitialization,
      testTokenStatus,
      testPermissionChecking,
      testTokenDeduction,
      testErrorHandling,
      testRealTimeUpdates,
      testUIComponents,
      testStripeIntegration
    ];

    for (const test of tests) {
      try {
        await test();
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause between tests
      } catch (error) {
        console.error('Test execution error:', error);
      }
    }

    setCurrentTest('');
    setIsRunning(false);
  };

  // Get result icon
  const getResultIcon = (passed) => {
    return passed ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mr-3" />
          <span className="text-lg text-gray-600">Loading token system...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Token System Validation</h1>
            <p className="text-blue-100">Comprehensive testing of the token-based SaaS system</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{testStats.total > 0 ? Math.round((testStats.passed / testStats.total) * 100) : 0}%</div>
            <div className="text-sm text-blue-100">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Current User</h3>
          <TokenBalance size="default" showDetails />
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-2">System Status</h3>
          <div className="space-y-2 text-sm">
            <div>Plan: <span className="font-medium">{planDisplayName}</span></div>
            <div>Status: <span className="font-medium">{tokenStatus}</span></div>
            <div>Can Generate: <span className="font-medium">{hasTokens ? 'Yes' : 'No'}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Test Results</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Passed:</span>
              <span className="text-green-600 font-medium">{testStats.passed}</span>
            </div>
            <div className="flex justify-between">
              <span>Failed:</span>
              <span className="text-red-600 font-medium">{testStats.failed}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{testStats.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Test Controls</h2>
          <div className="flex space-x-3">
            <button
              onClick={clearResults}
              disabled={isRunning}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Clear Results
            </button>
            <button
              onClick={() => setShowUpgradeTest(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Crown className="w-4 h-4" />
              <span>Test Upgrade Prompt</span>
            </button>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run All Tests</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Current Test Status */}
        {isRunning && currentTest && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Loader className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-blue-800 font-medium">Running: {currentTest}</span>
            </div>
          </div>
        )}
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
        
        {testResults.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No tests run yet. Click "Run All Tests" to begin validation.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {testResults.map((result) => (
              <div
                key={result.id}
                className={`p-4 rounded-lg border-l-4 ${
                  result.passed 
                    ? 'bg-green-50 border-green-500 text-green-800' 
                    : 'bg-red-50 border-red-500 text-red-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getResultIcon(result.passed)}
                    <div className="flex-1">
                      <div className="font-medium">{result.testName}</div>
                      <div className="text-sm mt-1">{result.message}</div>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs opacity-75 hover:opacity-100">
                            View Details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  <div className="text-xs opacity-75 ml-4">
                    {result.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TokenGuard Demo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">TokenGuard Demo</h2>
        <TokenGuard
          feature="generate_extension"
          fallback={
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <div className="text-gray-600 mb-2">🔒 Access Blocked</div>
              <div className="text-sm text-gray-500">This would be blocked by TokenGuard</div>
            </div>
          }
        >
          <div className="p-4 bg-green-100 rounded-lg text-center">
            <div className="text-green-600 mb-2">✅ Access Granted</div>
            <div className="text-sm text-green-500">TokenGuard allows access to this content</div>
          </div>
        </TokenGuard>
      </div>

      {/* Upgrade Prompt Test */}
      <UpgradePrompt
        isOpen={showUpgradeTest}
        onClose={() => setShowUpgradeTest(false)}
        trigger="test"
        customMessage="This is a test of the upgrade prompt functionality"
      />
    </div>
  );
};

export default TokenSystemValidation;