import React, { useState, useEffect } from 'react'
import { AlertTriangle, Lock, Crown, Loader } from 'lucide-react'
import { useTokenContext } from '../contexts/TokenContext'
import UpgradePrompt from './UpgradePrompt'

/**
 * TokenGuard Component
 * Wrapper that controls access to features based on token availability and plan permissions
 */
const TokenGuard = ({
  children,
  requiredTokens = 1,
  feature = null, // 'generate_extension', 'revise_extension', etc.
  fallback = null,
  showUpgradePrompt = true,
  loadingComponent = null,
  className = ''
}) => {
  const {
    hasTokens,
    currentTokens,
    isUnlimited,
    planName,
    canGenerateExtension,
    isLoading,
    isCheckingPermission,
    showUpgradePrompt: contextShowUpgrade,
    hideUpgradePrompt
  } = useTokenContext()

  const [permissionResult, setPermissionResult] = useState(null)
  const [showLocalUpgrade, setShowLocalUpgrade] = useState(false)
  const [isCheckingLocal, setIsCheckingLocal] = useState(false)

  // Check permissions when component mounts or dependencies change
  useEffect(() => {
    const checkPermissions = async () => {
      if (!feature) {
        // Simple token check
        const canProceed = isUnlimited || currentTokens >= requiredTokens
        setPermissionResult({
          allowed: canProceed,
          reason: canProceed ? 'Sufficient credits' : `Need ${requiredTokens} credits, have ${currentTokens}`,
          requiresUpgrade: !canProceed && planName === 'free'
        })
        return
      }

      // Feature-specific permission check
      if (feature === 'generate_extension') {
        setIsCheckingLocal(true)
        try {
          const result = await canGenerateExtension()
          // Convert canGenerate to allowed to match expected format
          setPermissionResult({
            allowed: result.canGenerate,
            reason: result.reason,
            requiresUpgrade: result.requiresUpgrade || false
          })
        } catch (error) {
          setPermissionResult({
            allowed: false,
            reason: error.message,
            requiresUpgrade: true
          })
        } finally {
          setIsCheckingLocal(false)
        }
      }
    }

    if (!isLoading) {
      checkPermissions()
    }
  }, [currentTokens, isUnlimited, planName, requiredTokens, feature, canGenerateExtension, isLoading])

  const handleUpgradeClick = () => {
    setShowLocalUpgrade(true)
  }

  const handleUpgradeClose = () => {
    setShowLocalUpgrade(false)
    hideUpgradePrompt()
  }

  // Loading state
  if (isLoading || isCheckingPermission || isCheckingLocal) {
    if (loadingComponent) {
      return loadingComponent
    }
    
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="text-sm">Checking permissions...</span>
        </div>
      </div>
    )
  }

  // Permission denied
  if (permissionResult && !permissionResult.allowed) {
    if (fallback) {
      return fallback
    }

    const getBlockedContent = () => {
      const isTokenIssue = permissionResult.reason?.includes('token') || permissionResult.reason?.includes('Insufficient')
      const isPlanIssue = permissionResult.requiresUpgrade

      if (isTokenIssue && isPlanIssue) {
        return {
          icon: <Crown className="w-8 h-8 text-yellow-500" />,
          title: 'Upgrade Needed',
          message: 'You need more tokens to continue. Upgrade your plan to get more tokens and unlock additional features.',
          buttonText: 'Upgrade Plan',
          buttonClass: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
        }
      } else if (isTokenIssue) {
        return {
          icon: <AlertTriangle className="w-8 h-8 text-orange-500" />,
          title: 'No Tokens Available',
          message: permissionResult.reason || 'You don\'t have enough tokens for this action.',
          buttonText: 'Get More Tokens',
          buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white'
        }
      } else {
        return {
          icon: <Lock className="w-8 h-8 text-gray-500" />,
          title: 'Feature Locked',
          message: permissionResult.reason || 'This feature is not available in your current plan.',
          buttonText: 'Upgrade Plan',
          buttonClass: 'bg-gray-600 hover:bg-gray-700 text-white'
        }
      }
    }

    const blockedContent = getBlockedContent()

    return (
      <div className={`text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="max-w-sm mx-auto">
          <div className="flex justify-center mb-4">
            {blockedContent.icon}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {blockedContent.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-6">
            {blockedContent.message}
          </p>
          
          {showUpgradePrompt && permissionResult.requiresUpgrade && (
            <button
              onClick={handleUpgradeClick}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${blockedContent.buttonClass}`}
            >
              {blockedContent.buttonText}
            </button>
          )}
          
          {!permissionResult.requiresUpgrade && (
            <div className="text-xs text-gray-500 mt-4">
              Contact support if you believe this is an error
            </div>
          )}
        </div>

        {/* Upgrade Prompt Modal */}
        <UpgradePrompt
          isOpen={showLocalUpgrade || contextShowUpgrade}
          onClose={handleUpgradeClose}
          trigger={permissionResult.reason?.includes('token') || permissionResult.reason?.includes('Insufficient') ? 'token_limit' : 'feature_limit'}
          customMessage={permissionResult.reason}
        />
      </div>
    )
  }

  // Permission granted - render children
  return (
    <div className={className}>
      {children}
      
      {/* Global upgrade prompt */}
      <UpgradePrompt
        isOpen={contextShowUpgrade}
        onClose={hideUpgradePrompt}
      />
    </div>
  )
}

/**
 * Higher-order component version of TokenGuard
 */
export const withTokenGuard = (WrappedComponent, guardOptions = {}) => {
  return function TokenGuardedComponent(props) {
    return (
      <TokenGuard {...guardOptions}>
        <WrappedComponent {...props} />
      </TokenGuard>
    )
  }
}

/**
 * Hook version for conditional rendering
 */
export const useTokenGuard = (requiredTokens = 1, feature = null) => {
  const {
    hasTokens,
    currentTokens,
    isUnlimited,
    canGenerateExtension
  } = useTokenContext()

  const [permission, setPermission] = useState({
    allowed: false,
    loading: true,
    reason: ''
  })

  useEffect(() => {
    const checkPermission = async () => {
      if (!feature) {
        // Simple token check
        const allowed = isUnlimited || currentTokens >= requiredTokens
        setPermission({
          allowed,
          loading: false,
          reason: allowed ? 'Sufficient credits' : `Need ${requiredTokens} credits, have ${currentTokens}`
        })
        return
      }

      // Feature-specific check
      if (feature === 'generate_extension') {
        try {
          const result = await canGenerateExtension()
          setPermission({
            allowed: result.canGenerate,
            loading: false,
            reason: result.reason
          })
        } catch (error) {
          setPermission({
            allowed: false,
            loading: false,
            reason: error.message
          })
        }
      }
    }

    checkPermission()
  }, [currentTokens, isUnlimited, requiredTokens, feature, canGenerateExtension])

  return permission
}

export default TokenGuard