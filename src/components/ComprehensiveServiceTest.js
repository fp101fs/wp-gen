import React, { useState, useEffect } from 'react'
import { tokenService } from '../services/TokenService'
import { planService, USER_TYPES } from '../services/PlanService'
import { getCurrentUser } from '../supabaseClient'

/**
 * Comprehensive Service Test Component
 * Tests both TokenService and PlanService functionality
 */
const ComprehensiveServiceTest = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser()
      if (user) {
        setUserId(user.id)
        setUserEmail(user.email)
      }
    }
    getUser()
  }, [])

  const runTest = async (category, testName, testFunction) => {
    setLoading(true)
    try {
      const startTime = Date.now()
      const result = await testFunction()
      const duration = Date.now() - startTime
      
      setResults(prev => ({
        ...prev,
        [`${category}.${testName}`]: {
          success: true,
          result,
          duration,
          timestamp: new Date().toISOString()
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [`${category}.${testName}`]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }))
    }
    setLoading(false)
  }

  // TokenService Tests
  const testTokenServiceHealth = () => 
    runTest('TokenService', 'healthCheck', () => tokenService.healthCheck())

  const testTokenBalance = () => 
    runTest('TokenService', 'checkBalance', () => tokenService.checkTokenBalance(userId))

  const testTokenValidation = () => 
    runTest('TokenService', 'validateOperation', () => tokenService.validateTokenOperation(userId, 1))

  const testTokenDeduction = () => 
    runTest('TokenService', 'deductToken', () => tokenService.deductToken(userId, 1, 'Service test deduction'))

  const testTokenAddition = () => 
    runTest('TokenService', 'addTokens', () => tokenService.addTokens(userId, 2, 'bonus', { testData: true }))

  const testTokenHistory = () => 
    runTest('TokenService', 'getHistory', () => tokenService.getTokenHistory(userId, 10))

  const testUserPlanDetails = () => 
    runTest('TokenService', 'getUserPlanDetails', () => tokenService.getUserPlanDetails(userId))

  // PlanService Tests
  const testGetUserPlan = () => 
    runTest('PlanService', 'getUserPlan', () => planService.getUserPlan(userId))

  const testCanGenerateExtension = () => 
    runTest('PlanService', 'canGenerate', () => 
      planService.canUserPerformAction(userId, 'generate_extension', { monthlyUsage: 0 }))

  const testCanReviseExtension = () => 
    runTest('PlanService', 'canRevise', () => 
      planService.canUserPerformAction(userId, 'revise_extension', { revisionCount: 1 }))

  const testCanAccessAnalytics = () => 
    runTest('PlanService', 'canAccessAnalytics', () => 
      planService.canUserPerformAction(userId, 'access_analytics'))

  const testGetAllPlans = () => 
    runTest('PlanService', 'getAllPlans', () => Promise.resolve(planService.getAllPlans()))

  const testGetPlanConfig = () => 
    runTest('PlanService', 'getPlanConfig', () => Promise.resolve(planService.getPlanConfig(USER_TYPES.PRO)))

  // Integration Tests
  const testFullGenerationFlow = () => 
    runTest('Integration', 'fullGenerationFlow', async () => {
      // Step 1: Check if user can generate
      const permission = await planService.canUserPerformAction(userId, 'generate_extension')
      
      if (!permission.allowed) {
        return {
          step: 'permission_check',
          allowed: false,
          reason: permission.reason
        }
      }

      // Step 2: Validate token operation
      const validation = await tokenService.validateTokenOperation(userId, 1)
      
      if (!validation.success || (!validation.canPerform && !validation.unlimited)) {
        return {
          step: 'token_validation',
          canPerform: validation.canPerform,
          unlimited: validation.unlimited,
          message: validation.message
        }
      }

      // Step 3: Simulate successful generation and deduct token
      const deduction = await tokenService.deductToken(userId, 1, 'Integration test - full flow')
      
      return {
        step: 'completed',
        permission,
        validation,
        deduction,
        success: deduction.success
      }
    })

  const testServiceCommunication = () => 
    runTest('Integration', 'serviceCommunication', async () => {
      // Test that both services return consistent data
      const tokenServiceData = await tokenService.getUserPlanDetails(userId)
      const planServiceData = await planService.getUserPlan(userId)
      
      return {
        tokenService: tokenServiceData,
        planService: planServiceData,
        consistent: tokenServiceData.success && planServiceData.success &&
                   tokenServiceData.plan?.name === planServiceData.plan?.type
      }
    })

  // Run all tests
  const runAllTests = async () => {
    console.log('Starting comprehensive service tests...')
    
    // TokenService tests
    await testTokenServiceHealth()
    await testTokenBalance()
    await testTokenValidation()
    await testUserPlanDetails()
    await testTokenHistory()
    
    // PlanService tests
    await testGetUserPlan()
    await testCanGenerateExtension()
    await testCanReviseExtension()
    await testCanAccessAnalytics()
    await testGetAllPlans()
    await testGetPlanConfig()
    
    // Integration tests
    await testServiceCommunication()
    
    // Token operations (do these last as they modify state)
    await testTokenAddition()
    await testTokenDeduction()
    await testFullGenerationFlow()
    
    console.log('All tests completed!')
  }

  const clearResults = () => setResults({})

  if (!userId) {
    return (
      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 m-4">
        <h3 className="text-yellow-800 font-bold">Service Tests</h3>
        <p className="text-yellow-600">Please log in to test the services</p>
      </div>
    )
  }

  const categorizedResults = Object.entries(results).reduce((acc, [key, result]) => {
    const [category, testName] = key.split('.')
    if (!acc[category]) acc[category] = {}
    acc[category][testName] = result
    return acc
  }, {})

  return (
    <div className="bg-gray-50 rounded-lg p-6 m-4 max-w-7xl">
      <h3 className="text-gray-800 font-bold text-xl mb-4">🧪 Comprehensive Service Test Suite</h3>
      
      <div className="mb-6 bg-white rounded-lg p-4 border">
        <h4 className="font-semibold text-gray-700 mb-2">Test Environment:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>User ID:</strong>
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">{userId}</code>
          </div>
          <div>
            <strong>Email:</strong>
            <span className="ml-2">{userEmail}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <h4 className="w-full font-semibold text-gray-700 mb-2">Individual Tests:</h4>
        
        {/* TokenService Tests */}
        <div className="w-full mb-2">
          <h5 className="text-sm font-medium text-blue-700">TokenService Tests:</h5>
          <div className="flex flex-wrap gap-1 mt-1">
            <button onClick={testTokenServiceHealth} disabled={loading} className="btn-test-small">Health Check</button>
            <button onClick={testTokenBalance} disabled={loading} className="btn-test-small">Check Balance</button>
            <button onClick={testTokenValidation} disabled={loading} className="btn-test-small">Validate Operation</button>
            <button onClick={testUserPlanDetails} disabled={loading} className="btn-test-small">Get Plan Details</button>
            <button onClick={testTokenHistory} disabled={loading} className="btn-test-small">Get History</button>
          </div>
        </div>

        {/* PlanService Tests */}
        <div className="w-full mb-2">
          <h5 className="text-sm font-medium text-purple-700">PlanService Tests:</h5>
          <div className="flex flex-wrap gap-1 mt-1">
            <button onClick={testGetUserPlan} disabled={loading} className="btn-test-small">Get User Plan</button>
            <button onClick={testCanGenerateExtension} disabled={loading} className="btn-test-small">Can Generate</button>
            <button onClick={testCanReviseExtension} disabled={loading} className="btn-test-small">Can Revise</button>
            <button onClick={testCanAccessAnalytics} disabled={loading} className="btn-test-small">Can Access Analytics</button>
            <button onClick={testGetAllPlans} disabled={loading} className="btn-test-small">Get All Plans</button>
            <button onClick={testGetPlanConfig} disabled={loading} className="btn-test-small">Get Plan Config</button>
          </div>
        </div>

        {/* Integration Tests */}
        <div className="w-full mb-2">
          <h5 className="text-sm font-medium text-green-700">Integration Tests:</h5>
          <div className="flex flex-wrap gap-1 mt-1">
            <button onClick={testServiceCommunication} disabled={loading} className="btn-test-small">Service Communication</button>
            <button onClick={testFullGenerationFlow} disabled={loading} className="btn-test-small">Full Generation Flow</button>
          </div>
        </div>

        {/* Token Operations (Modify State) */}
        <div className="w-full mb-4">
          <h5 className="text-sm font-medium text-red-700">Token Operations (Modifies State):</h5>
          <div className="flex flex-wrap gap-1 mt-1">
            <button onClick={testTokenAddition} disabled={loading} className="btn-test-small">Add Tokens (+2)</button>
            <button onClick={testTokenDeduction} disabled={loading} className="btn-test-small">Deduct Token (-1)</button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={runAllTests} disabled={loading} className="btn-primary">
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>
        <button onClick={clearResults} className="btn-secondary">Clear Results</button>
      </div>

      {/* Results Display */}
      {Object.keys(categorizedResults).length > 0 && (
        <div className="space-y-6">
          <h4 className="font-semibold text-gray-700">Test Results:</h4>
          
          {Object.entries(categorizedResults).map(([category, tests]) => (
            <div key={category} className="bg-white rounded-lg border">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h5 className="font-medium text-gray-800">{category} Tests</h5>
              </div>
              
              <div className="p-4 space-y-4">
                {Object.entries(tests).map(([testName, result]) => (
                  <div key={testName} className={`border rounded-lg p-4 ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h6 className={`font-medium ${
                        result.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {testName} {result.success ? '✅' : '❌'}
                      </h6>
                      <div className="text-xs text-gray-500">
                        {result.duration && `${result.duration}ms`} | {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    {result.success ? (
                      <div className="text-sm">
                        <pre className="bg-white border rounded p-2 overflow-auto max-h-48 text-xs">
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-red-700 text-sm">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .btn-test-small {
          @apply px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed;
        }
        .btn-primary {
          @apply px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed;
        }
        .btn-secondary {
          @apply px-4 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600;
        }
      `}</style>
    </div>
  )
}

export default ComprehensiveServiceTest