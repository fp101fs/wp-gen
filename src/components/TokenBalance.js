import React from 'react'
import { Zap, Crown, AlertTriangle, CheckCircle } from 'lucide-react'
import { useTokenContext } from '../contexts/TokenContext'

/**
 * TokenBalance Component
 * Displays user's current token balance with status indicators
 */
const TokenBalance = ({ 
  size = 'default', 
  showDetails = false, 
  className = '',
  onClick = null 
}) => {
  const {
    currentTokens,
    isUnlimited,
    planName,
    planDisplayName,
    tokenStatus,
    subscription,
    isLoading,
    lastUpdated
  } = useTokenContext()

  if (isLoading) {
    if (showDetails) {
      return (
        <div className={`bg-white rounded-lg border shadow-sm p-4 ${className}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded animate-pulse"></div>
              <h3 className="font-semibold text-gray-800">Token Balance</h3>
            </div>
            <div className="text-xs text-gray-500">Loading...</div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-purple-200 rounded-full"></div>
                  <div className="absolute inset-0 w-10 h-10 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Setting up your account</p>
                  <p className="text-xs text-gray-500 mt-1">This may take a few moments...</p>
                </div>
              </div>
            </div>
            
            <div className="animate-pulse space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="w-12 h-4 bg-gray-200 rounded"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  const getStatusColor = () => {
    switch (tokenStatus) {
      case 'unlimited': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'low': return 'text-yellow-600'
      case 'depleted': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = () => {
    switch (tokenStatus) {
      case 'unlimited': return <Crown className="w-4 h-4 text-green-600" />
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-600" />
      case 'low': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'depleted': return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <Zap className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusMessage = () => {
    switch (tokenStatus) {
      case 'unlimited': return 'Unlimited credits'
      case 'good': return `${currentTokens} credits available`
      case 'low': return `Only ${currentTokens} credits left`
      case 'depleted': return 'No credits remaining'
      default: return `${currentTokens} credits`
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'text-sm',
          icon: 'w-3 h-3',
          text: 'text-sm'
        }
      case 'large':
        return {
          container: 'text-lg',
          icon: 'w-5 h-5',
          text: 'text-lg font-medium'
        }
      default:
        return {
          container: 'text-base',
          icon: 'w-4 h-4',
          text: 'text-base'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  const TokenDisplay = () => (
    <div className={`flex items-center space-x-2 ${sizeClasses.container} ${className}`}>
      {getStatusIcon()}
      <div className="flex items-center space-x-1">
        <span className={`font-medium ${getStatusColor()}`}>
          {isUnlimited ? '∞' : currentTokens}
        </span>
        {!isUnlimited && (
          <span className="text-gray-500 text-sm">
            token{currentTokens !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {showDetails && (
        <div className="ml-2 text-xs text-gray-500">
          ({planDisplayName})
        </div>
      )}
    </div>
  )

  const DetailedDisplay = () => (
    <div className={`bg-white rounded-lg border shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <h3 className="font-semibold text-gray-800">Token Balance</h3>
        </div>
        {lastUpdated && (
          <div className="text-xs text-gray-500">
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Current Balance:</span>
          <span className={`font-medium ${getStatusColor()}`}>
            {isUnlimited ? 'Unlimited' : `${currentTokens} tokens`}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Plan:</span>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-800">{planDisplayName}</span>
            {subscription?.status === 'active' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Active
              </span>
            )}
          </div>
        </div>
        
        {tokenStatus === 'low' && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              You're running low on tokens. Consider upgrading your plan.
            </p>
          </div>
        )}
        
        {tokenStatus === 'depleted' && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 text-sm">
              You've used all your tokens. Upgrade to continue generating extensions.
            </p>
          </div>
        )}
      </div>
    </div>
  )

  if (showDetails) {
    return onClick ? (
      <button onClick={onClick} className="w-full text-left hover:shadow-md transition-shadow">
        <DetailedDisplay />
      </button>
    ) : (
      <DetailedDisplay />
    )
  }

  return onClick ? (
    <button onClick={onClick} className="hover:opacity-80 transition-opacity">
      <TokenDisplay />
    </button>
  ) : (
    <TokenDisplay />
  )
}

export default TokenBalance