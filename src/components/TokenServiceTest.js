import React, { useState } from 'react'
import { tokenService } from '../services/TokenService'
import { getCurrentUser } from '../supabaseClient'

/**
 * Comprehensive TokenService Test Component
 * Tests all TokenService methods with real data
 */
const TokenServiceTest = () => {
  const [testResults, setTestResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')

  // Get current user ID
  React.useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [])

  const runTest = async (testName, testFunction) => {
    setLoading(true)
    try {
      const startTime = Date.now()
      const result = await testFunction()
      const duration = Date.now() - startTime
      
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: true,
          result,
          duration,
          timestamp: new Date().toISOString()
        }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }))
    }
    setLoading(false)
  }

  const testCheckBalance = () => runTest('checkBalance', async () => {
    return await tokenService.checkTokenBalance(userId)
  })

  const testValidateOperation = () => runTest('validateOperation', async () => {
    return await tokenService.validateTokenOperation(userId, 1)
  })

  const testDeductToken = () => runTest('deductToken', async () => {
    return await tokenService.deductToken(userId, 1, 'TokenService test deduction')
  })

  const testAddTokens = () => runTest('addTokens', async () => {
    return await tokenService.addTokens(userId, 2, 'bonus', { test: true })
  })

  const testGetHistory = () => runTest('getHistory', async () => {
    return await tokenService.getTokenHistory(userId, 5)
  })

  const testGetPlanDetails = () => runTest('getPlanDetails', async () => {
    return await tokenService.getUserPlanDetails(userId)
  })

  const testHealthCheck = () => runTest('healthCheck', async () => {
    return await tokenService.healthCheck()
  })

  const testRateLimit = () => runTest('rateLimit', async () => {
    // Test rate limiting by making multiple rapid requests
    const promises = Array(5).fill().map(() => 
      tokenService.checkTokenBalance(userId)
    )
    return await Promise.all(promises)
  })

  const testInvalidInputs = () => runTest('invalidInputs', async () => {
    const tests = []
    
    // Test invalid user ID
    try {
      await tokenService.deductToken('', 1)
      tests.push({ name: 'empty userId', success: false })
    } catch (error) {
      tests.push({ name: 'empty userId', success: true, error: error.message })
    }

    // Test invalid token amount
    try {
      await tokenService.deductToken(userId, -1)
      tests.push({ name: 'negative amount', success: false })
    } catch (error) {
      tests.push({ name: 'negative amount', success: true, error: error.message })
    }

    // Test invalid token source
    try {
      await tokenService.addTokens(userId, 1, 'invalid_source')
      tests.push({ name: 'invalid source', success: false })
    } catch (error) {
      tests.push({ name: 'invalid source', success: true, error: error.message })
    }

    return tests
  })

  const runAllTests = async () => {
    await testHealthCheck()
    await testCheckBalance()
    await testValidateOperation()
    await testGetPlanDetails()
    await testGetHistory()
    await testAddTokens()
    await testDeductToken()
    await testRateLimit()
    await testInvalidInputs()
  }

  const clearResults = () => {
    setTestResults({})
  }

  if (!userId) {
    return (
      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 m-4">
        <h3 className="text-yellow-800 font-bold">TokenService Test</h3>
        <p className="text-yellow-600">Please log in to test TokenService</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 rounded-lg p-6 m-4 max-w-6xl">
      <h3 className="text-gray-800 font-bold text-xl mb-4">🧪 TokenService Test Suite</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">User ID: <code>{userId}</code></p>
        <div className="flex flex-wrap gap-2">
          <button onClick={testHealthCheck} disabled={loading} className="btn-test">Health Check</button>
          <button onClick={testCheckBalance} disabled={loading} className="btn-test">Check Balance</button>
          <button onClick={testValidateOperation} disabled={loading} className="btn-test">Validate Operation</button>
          <button onClick={testGetPlanDetails} disabled={loading} className="btn-test">Get Plan Details</button>
          <button onClick={testGetHistory} disabled={loading} className="btn-test">Get History</button>
          <button onClick={testAddTokens} disabled={loading} className="btn-test">Add Tokens</button>
          <button onClick={testDeductToken} disabled={loading} className="btn-test">Deduct Token</button>
          <button onClick={testRateLimit} disabled={loading} className="btn-test">Rate Limit Test</button>
          <button onClick={testInvalidInputs} disabled={loading} className="btn-test">Invalid Inputs</button>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={runAllTests} disabled={loading} className="btn-primary">
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </button>
          <button onClick={clearResults} className="btn-secondary">Clear Results</button>
        </div>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Test Results:</h4>
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className={`border rounded-lg p-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex justify-between items-start mb-2">
                <h5 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testName} {result.success ? '✅' : '❌'}
                </h5>
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
      )}

      <style jsx>{`
        .btn-test {
          @apply px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed;
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

export default TokenServiceTest