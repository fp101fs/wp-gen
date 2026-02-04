import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Crown, CreditCard, Download, Calendar, CheckCircle, AlertCircle, Zap, TrendingUp, Settings, User, ChevronDown, X, RefreshCw, HelpCircle, MessageSquare } from 'lucide-react';
import Header from './Header';
import { useTokenContext } from './contexts/TokenContext';
import { planService } from './services/PlanService';
import { supabase } from './supabaseClient';
import SupportFeedbackModal from './components/SupportFeedbackModal';
import useDocumentTitle from './hooks/useDocumentTitle';
import { debugLog, debugError } from './utils/debugUtils';

function AccountPage({ onShowLoginModal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [downgradeType, setDowngradeType] = useState(null); // 'cancel' or 'downgrade'
  const [isProcessingDowngrade, setIsProcessingDowngrade] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [userMessages, setUserMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  const { 
    currentTokens, 
    planName, 
    planDisplayName, 
    isUnlimited, 
    totalUsed, 
    showUpgradePromptAction,
    refresh,
    isSyncing,
    setSyncState
  } = useTokenContext();

  // Set page title
  useDocumentTitle('Account Settings - Kromio.ai');

  useEffect(() => {
    loadAccountData();
  }, []);

  // Check for navigation state to set active tab
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state to prevent it from persisting on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Load user messages when messages tab is active
  useEffect(() => {
    if (activeTab === 'messages') {
      loadUserMessages();
    }
  }, [activeTab]);


  const loadAccountData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      // Load subscription data - include active subscriptions and those canceled at period end
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plans (*)
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing']) // Include active and trialing subscriptions
        .order('created_at', { ascending: false });

      const subscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;
      debugLog('🔍 Subscription query result:', { subscription, subError, allSubscriptions: subscriptions });

      setUserSubscription(subscription);

      // Auto-sync if there's a plan mismatch between TokenContext and subscription data
      if (subscription && planName && subscription.plans?.name !== planName) {
        debugLog('🔍 Plan mismatch detected:', {
          tokenContextPlan: planName,
          subscriptionPlan: subscription.plans?.name,
          needsSync: true
        });
        
        // Try to get the actual plan from Stripe and update accordingly
        // For now, just log this - we'll implement auto-sync later
        debugLog('⚠️ Plan sync needed - TokenContext shows:', planName, 'but subscription shows:', subscription.plans?.name);
      }

      // Load billing history (token transactions)
      const { data: transactions } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setBillingHistory(transactions || []);
      
    } catch (error) {
      debugError('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserMessages = async () => {
    setMessagesLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('user_messages')
        .select(`
          *,
          extensions(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        debugError('Error loading user messages:', error);
      } else {
        setUserMessages(data || []);
      }
    } catch (error) {
      debugError('Error loading user messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    
    // Check if date is valid (handles null, undefined, and invalid dates)
    if (isNaN(date.getTime())) return 'Invalid date';
    
    // Check for Unix epoch (Jan 1, 1970) which indicates unset/null timestamp
    if (date.getTime() === 0 || date.getFullYear() === 1970) return 'Not set';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUsagePercentage = () => {
    if (isUnlimited) return 0;
    const total = totalUsed + currentTokens;
    return total > 0 ? (totalUsed / total) * 100 : 0;
  };

  const getCurrentPlanConfig = () => {
    return planService.getAllPlans()[planName] || {};
  };

  const handleDowngradeClick = (type) => {
    setDowngradeType(type);
    setShowDowngradeModal(true);
  };

  const handleConfirmDowngrade = async () => {
    if (!userSubscription) return;
    
    setIsProcessingDowngrade(true);
    try {
      if (downgradeType === 'cancel') {
        await handleCancelSubscription();
      } else if (downgradeType === 'downgrade') {
        await handleDowngradePlan();
      }
    } catch (error) {
      debugError('Downgrade error:', error);
    } finally {
      setIsProcessingDowngrade(false);
      setShowDowngradeModal(false);
      setDowngradeType(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: userSubscription.stripe_subscription_id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      const result = await response.json();
      debugLog('Subscription cancellation result:', result);
      
      // Refresh account data
      await loadAccountData();
      refresh(); // Refresh token context
      
    } catch (error) {
      debugError('Error canceling subscription:', error);
      throw error;
    }
  };

  const handleDowngradePlan = async () => {
    try {
      debugLog('🔍 Frontend downgrade logic:', { 
        currentPlanName: planName, 
        planDisplayName,
        userSubscription: userSubscription?.stripe_subscription_id
      });
      
      let targetPlan;
      if (planName === 'unlimited') {
        targetPlan = 'pro';
        debugLog('✅ Setting targetPlan to pro (unlimited -> pro)');
      } else if (planName === 'pro') {
        targetPlan = 'free';
        debugLog('✅ Setting targetPlan to free (pro -> free)');
      } else {
        throw new Error('Cannot downgrade from free plan');
      }

      const response = await fetch('/api/downgrade-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: userSubscription.stripe_subscription_id,
          targetPlan: targetPlan
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        // Debug logging for auto-sync troubleshooting
        debugLog('🔍 Downgrade failed - analyzing error for auto-sync:', {
          status: response.status,
          error: result.error,
          currentPlan: result.currentPlan,
          requestedPlan: result.requestedPlan,
          hasAlreadyOnText: result.error?.includes('already on'),
          planMismatch: result.currentPlan !== result.requestedPlan
        });
        
        // Show more helpful error messages and trigger auto-sync for plan mismatch issues
        if ((result.error && (result.error.includes('already on') || result.currentPlan !== result.requestedPlan)) || response.status === 400) {
          debugLog('🔄 Plan sync issue detected - auto-syncing with Stripe...');
          
          try {
            // Get current user for sync
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) {
              throw new Error('User not authenticated');
            }
            
            // Automatically sync with Stripe
            const syncResponse = await fetch('/api/sync-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: currentUser.id
              }),
            });
            
            const syncResult = await syncResponse.json();
            
            if (syncResponse.ok && syncResult.success) {
              debugLog('✅ Auto-sync successful:', syncResult);
              alert(`✅ Plan synced! You are now on the ${syncResult.currentPlan} plan.`);
              
              // Refresh data to reflect the sync
              await loadAccountData();
              refresh(); // Refresh token context
              
              // If sync requires page reload, do it
              if (syncResult.requiresPageReload) {
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
              return;
            } else {
              debugError('❌ Auto-sync failed:', syncResult);
              alert(`Plan sync issue: Your subscription is already on the ${result.currentPlan} plan. Please try the manual sync button.`);
            }
          } catch (syncError) {
            debugError('❌ Auto-sync error:', syncError);
            alert(`Plan sync issue: Your subscription is already on the ${result.currentPlan} plan. Please try the manual sync button.`);
          }
          
          // Fallback: refresh data anyway
          await loadAccountData();
          refresh(); // Refresh token context
          return;
        }
        throw new Error(result.error || 'Failed to downgrade subscription');
      }

      debugLog('Subscription downgrade result:', result);
      
      // Check if this was a successful downgrade that might need sync
      if (result.success && result.action === 'downgrade' && result.targetPlan) {
        debugLog('🔄 Successful downgrade detected - checking if sync needed...');
        setSyncState(true); // Show loading state
        
        // Give the webhook a moment to process, then check for sync issues
        setTimeout(async () => {
          try {
            debugLog('🔍 Checking for plan sync after downgrade...');
            
            // Get current user for sync check
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) return;
            
            // Call sync API to ensure database matches Stripe
            const syncResponse = await fetch('/api/sync-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: currentUser.id
              }),
            });
            
            const syncResult = await syncResponse.json();
            
            if (syncResponse.ok && syncResult.success && syncResult.needsSync) {
              debugLog('✅ Auto-sync after downgrade successful:', syncResult);
              alert(`✅ Downgrade processed! Your plan has been updated to ${syncResult.currentPlan}.`);
              
              // Refresh data to reflect the sync
              await loadAccountData();
              refresh(); // Refresh token context
              
              // If sync requires page reload, do it
              if (syncResult.requiresPageReload) {
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            } else {
              debugLog('ℹ️ No sync needed after downgrade or sync failed');
            }
          } catch (syncError) {
            debugError('❌ Auto-sync after downgrade error:', syncError);
          } finally {
            setSyncState(false); // Clear loading state
          }
        }, 2000); // Wait 2 seconds for webhook processing
      }
      
      // Refresh account data
      await loadAccountData();
      refresh(); // Refresh token context
      
    } catch (error) {
      debugError('Error downgrading subscription:', error);
      throw error;
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      const response = await fetch('/api/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: userSubscription.stripe_subscription_id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      const result = await response.json();
      debugLog('Subscription reactivation result:', result);
      
      // Refresh account data
      await loadAccountData();
      refresh(); // Refresh token context
      
    } catch (error) {
      debugError('Error reactivating subscription:', error);
      throw error;
    }
  };

  const handleSyncTokens = async () => {
    // Same as handleSyncSubscription - they're the same function
    await handleSyncSubscription();
  };

  const handleSyncSubscription = async () => {
    debugLog('🔄 Sync button clicked - using API sync endpoint');
    setSyncState(true); // Show loading state
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        debugLog('❌ No user found');
        setSyncState(false);
        return;
      }

      debugLog('🔍 Calling API sync endpoint for user:', user.id);
      
      // Call the proper API endpoint that handles syncing with Stripe
      const response = await fetch('/api/sync-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        debugError('❌ Sync API failed:', response.status, errorText);
        throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      debugLog('✅ Sync API result:', result);

      if (result.success) {
        if (result.needsSync) {
          alert(`✅ Subscription synced! Plan updated from ${result.oldPlan} to ${result.newPlan} to match Stripe.`);
        } else {
          alert('✅ Subscription is already in sync with Stripe.');
        }

        // Force complete refresh of all data
        debugLog('🔄 Forcing complete data refresh...');
        
        // Force a hard refresh by reloading the page after a short delay
        // This ensures all cached data (TokenContext, database functions, etc.) is cleared
        alert(`✅ Subscription synced! The page will refresh to ensure all data is up to date.`);
        
        setTimeout(() => {
          debugLog('🔄 Performing hard refresh to clear all caches...');
          window.location.reload();
        }, 1000);
        
      } else {
        throw new Error(result.error || 'Sync failed');
      }
      
    } catch (error) {
      debugError('Error syncing subscription:', error);
      alert(`Failed to sync subscription: ${error.message}`);
    } finally {
      setSyncState(false); // Clear loading state
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header onShowLoginModal={onShowLoginModal} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-white text-xl">Loading your account...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10">
        <Header onShowLoginModal={onShowLoginModal} />
        
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="mr-4 p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
              <p className="text-gray-300">Manage your subscription, usage, and billing</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/10 rounded-lg p-1 mb-8 w-fit">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'billing'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Billing
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'usage'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Usage
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'messages'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Messages
            </button>
          </div>


          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Current Plan Card */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 relative">
                  {/* Loading Overlay */}
                  {isSyncing && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <p className="text-white font-medium">Syncing your account...</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{planDisplayName} Plan</h2>
                        <p className="text-gray-300">
                          {userSubscription ? (
                            userSubscription.cancel_at_period_end ? 
                              'Canceling at period end' : 
                              'Active subscription'
                          ) : 'Current plan'}
                        </p>
                        {userSubscription && userSubscription.cancel_at_period_end && (
                          <p className="text-yellow-400 text-sm mt-1">
                            Ends {formatDate(userSubscription.current_period_end)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-3">
                      {planName !== 'unlimited' && !userSubscription?.cancel_at_period_end && (
                        <button
                          onClick={() => showUpgradePromptAction('Upgrade from account page')}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                        >
                          {planName === 'free' ? 'Upgrade to Pro' : 'Go Max'}
                        </button>
                      )}
                      
                      {userSubscription && userSubscription.cancel_at_period_end && (
                        <button
                          onClick={handleReactivateSubscription}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                        >
                          Reactivate Subscription
                        </button>
                      )}
                      
                      {/* Sync button for debugging plan mismatches */}
                      {/* <button
                        onClick={handleSyncSubscription}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                      >
                        🔄 Sync with Stripe
                      </button> */}
                      
                      {/* Show downgrade options for paid plans */}
                      {planName !== 'free' && (
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          {/* Downgrade buttons - show if user has subscription or is on paid plan */}
                          {(userSubscription && !userSubscription.cancel_at_period_end) || (!userSubscription && planName !== 'free') ? (
                            <>
                              {planName === 'unlimited' && (
                                <button
                                  onClick={() => handleDowngradeClick('downgrade')}
                                  className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                                >
                                  Downgrade to Pro
                                </button>
                              )}
                              {planName === 'pro' && (
                                <button
                                  onClick={() => handleDowngradeClick('downgrade')}
                                  className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                                >
                                  Downgrade to Free
                                </button>
                              )}
                              {/* Cancel button - only show if we have an actual subscription */}
                              {userSubscription && (
                                <button
                                  onClick={() => handleDowngradeClick('cancel')}
                                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                                >
                                  Cancel Subscription
                                </button>
                              )}
                            </>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-white font-semibold">Tokens</h3>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {isUnlimited ? 'Unlimited' : currentTokens}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {isUnlimited ? 'Generate as many extensions as you want' : 'Tokens remaining'}
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <h3 className="text-white font-semibold">Extensions Created</h3>
                      </div>
                      <p className="text-2xl font-bold text-white">{totalUsed}</p>
                      <p className="text-gray-400 text-sm">Total extensions generated</p>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  {!isUnlimited && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">Usage This Period</h3>
                        <span className="text-gray-300 text-sm">
                          {totalUsed} / {totalUsed + currentTokens} tokens used
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Subscription Status Alert */}
                  {userSubscription && userSubscription.cancel_at_period_end && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        <div>
                          <p className="text-yellow-300 font-medium">Subscription Ending Soon</p>
                          <p className="text-yellow-200 text-sm">
                            Your {planDisplayName} subscription will end on {formatDate(userSubscription.current_period_end)}. 
                            You'll be automatically moved to the Free plan unless you reactivate.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subscription Info */}
                  {userSubscription && (
                    <div className="border-t border-white/10 pt-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Current Period</p>
                          <p className="text-white">
                            {formatDate(userSubscription.current_period_start)} - {formatDate(userSubscription.current_period_end)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Status</p>
                          <div className="flex items-center space-x-2">
                            {userSubscription.cancel_at_period_end ? (
                              <>
                                <AlertCircle className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-300">Ending Soon</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-white capitalize">{userSubscription.status}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('billing')}
                      className="w-full flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <CreditCard className="w-5 h-5 text-gray-300" />
                      <span className="text-white">View Billing History</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('usage')}
                      className="w-full flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <TrendingUp className="w-5 h-5 text-gray-300" />
                      <span className="text-white">Usage Analytics</span>
                    </button>
                    <button
                      onClick={() => navigate('/my-extensions')}
                      className="w-full flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Download className="w-5 h-5 text-gray-300" />
                      <span className="text-white">My Extensions</span>
                    </button>
                  </div>
                </div>

                {/* Support & Feedback */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold mb-4">Need Help?</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowSupportModal(true)}
                      className="w-full flex items-center space-x-3 p-3 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                    >
                      <HelpCircle className="w-5 h-5 text-blue-400" />
                      <span className="text-white">Get Support</span>
                    </button>
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="w-full flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/20"
                    >
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      <span className="text-white">Send Feedback</span>
                    </button>
                  </div>
                </div>

                {/* Plan Comparison */}
                {planName !== 'unlimited' && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                    <h3 className="text-white font-semibold mb-4">Upgrade Benefits</h3>
                    <div className="space-y-2 text-sm">
                      {planName === 'free' && (
                        <>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">150 credits/month</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">Create Extensions</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">Revise & Remix Extensions</span>
                          </div>
                        </>
                      )}
                      {planName === 'pro' && (
                        <>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">500 credits/month</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">Create Extensions</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">Revise & Remix Extensions</span>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => showUpgradePromptAction('Upgrade from benefits card')}
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 rounded-lg font-semibold transition-all duration-300"
                    >
                      Upgrade Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="max-w-4xl">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Billing History</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>Last 10 transactions</span>
                  </div>
                </div>

                {billingHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">No billing history</h3>
                    <p className="text-gray-400">Your transaction history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {billingHistory.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.transaction_type === 'purchase' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            {transaction.transaction_type === 'purchase' ? (
                              <Zap className="w-5 h-5 text-green-400" />
                            ) : (
                              <TrendingUp className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{transaction.description}</p>
                            <p className="text-gray-400 text-sm">{formatDate(transaction.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.transaction_type === 'purchase' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.transaction_type === 'purchase' ? '+' : '-'}{transaction.tokens}
                          </p>
                          <p className="text-gray-400 text-sm">tokens</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="max-w-4xl">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Usage Analytics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/5 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Zap className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-white font-semibold">Total Tokens</h3>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">
                      {isUnlimited ? '∞' : totalUsed + currentTokens}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {isUnlimited ? 'Unlimited plan' : 'Total allocated'}
                    </p>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                      <h3 className="text-white font-semibold">Used</h3>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">{totalUsed}</p>
                    <p className="text-gray-400 text-sm">Extensions created</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <CheckCircle className="w-6 h-6 text-blue-400" />
                      <h3 className="text-white font-semibold">Remaining</h3>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">
                      {isUnlimited ? '∞' : currentTokens}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {isUnlimited ? 'Unlimited' : 'Tokens left'}
                    </p>
                  </div>
                </div>

                {!isUnlimited && (
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-4">Usage Progress</h3>
                    <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>0 tokens</span>
                      <span>{Math.round(getUsagePercentage())}% used</span>
                      <span>{totalUsed + currentTokens} tokens</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="max-w-4xl">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Messages</h2>
                  <button
                    onClick={loadUserMessages}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>

                {messagesLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span className="text-white ml-3">Loading messages...</span>
                  </div>
                ) : userMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">No messages yet</h3>
                    <p className="text-gray-400 mb-6">Your support requests and feedback will appear here</p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setShowSupportModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <HelpCircle className="w-5 h-5" />
                        <span>Get Support</span>
                      </button>
                      <button
                        onClick={() => setShowFeedbackModal(true)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span>Send Feedback</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userMessages.map((message) => (
                      <div key={message.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                        {/* Message Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                message.type === 'support' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {message.type === 'support' ? 'Support Request' : 'Feedback'}
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                message.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                                message.status === 'replied' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {message.status === 'replied' ? 'Replied' : message.status}
                              </span>
                            </div>
                            
                            {message.extensions && (
                              <div className="text-sm text-blue-400 mb-2">
                                Extension: {message.extensions.name}
                              </div>
                            )}
                            
                            {message.subject && (
                              <h3 className="text-xl font-semibold text-white mb-2">
                                {message.subject}
                              </h3>
                            )}
                          </div>
                          
                          <div className="text-right text-sm text-gray-400 ml-4">
                            {formatDate(message.created_at)}
                          </div>
                        </div>
                        
                        {/* Original Message */}
                        <div className="bg-white/5 rounded-lg p-4 mb-4">
                          <div className="text-gray-300 whitespace-pre-wrap">
                            {message.message}
                          </div>
                        </div>
                        
                        {/* Admin Reply */}
                        {message.admin_reply && (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                              <h4 className="text-green-400 font-semibold">Admin Reply</h4>
                              <span className="text-gray-400 text-sm ml-3">
                                {formatDate(message.replied_at)}
                              </span>
                            </div>
                            <div className="text-gray-200 whitespace-pre-wrap">
                              {message.admin_reply}
                            </div>
                          </div>
                        )}
                        
                        {/* Status indicator for unreplied messages */}
                        {!message.admin_reply && message.status === 'open' && (
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-4">
                            <div className="flex items-center text-yellow-300">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                              <span className="text-sm">Waiting for admin response</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Send New Message */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                      <h3 className="text-white font-semibold mb-4">Need more help?</h3>
                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={() => setShowSupportModal(true)}
                          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <HelpCircle className="w-5 h-5" />
                          <span>Get Support</span>
                        </button>
                        <button
                          onClick={() => setShowFeedbackModal(true)}
                          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <MessageSquare className="w-5 h-5" />
                          <span>Send Feedback</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Downgrade Confirmation Modal */}
      {showDowngradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {downgradeType === 'cancel' ? 'Cancel Subscription' : 'Downgrade Plan'}
              </h3>
              <button
                onClick={() => setShowDowngradeModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              {downgradeType === 'cancel' ? (
                <div>
                  <p className="text-gray-300 mb-4">
                    Are you sure you want to cancel your {planDisplayName} subscription?
                  </p>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                    <p className="text-yellow-300 text-sm">
                      <strong>What happens next:</strong>
                    </p>
                    <ul className="text-yellow-200 text-sm mt-2 space-y-1">
                      <li>• Your subscription will remain active until {userSubscription && formatDate(userSubscription.current_period_end)}</li>
                      <li>• After that, you'll be downgraded to the Free plan</li>
                      <li>• You'll keep your current tokens until used</li>
                      <li>• You can reactivate anytime before the period ends</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-300 mb-4">
                    Are you sure you want to downgrade from {planDisplayName} to{' '}
                    {planName === 'unlimited' ? 'Pro' : 'Free'} plan?
                  </p>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                    <p className="text-orange-300 text-sm">
                      <strong>What you'll lose:</strong>
                    </p>
                    <ul className="text-orange-200 text-sm mt-2 space-y-1">
                      {planName === 'unlimited' && (
                        <>
                          <li>• Unlimited token generation</li>
                          <li>• Advanced features and API access</li>
                          <li>• Priority support</li>
                        </>
                      )}
                      {planName === 'pro' && (
                        <>
                          <li>• 30 monthly tokens (down to 3)</li>
                          <li>• Unlimited revisions</li>
                          <li>• Priority support</li>
                        </>
                      )}
                    </ul>
                  </div>
                  <p className="text-gray-400 text-sm">
                    The change will take effect at your next billing cycle ({userSubscription && formatDate(userSubscription.current_period_end)}).
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDowngradeModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Keep My Plan
              </button>
              <button
                onClick={handleConfirmDowngrade}
                disabled={isProcessingDowngrade}
                className={`flex-1 ${
                  downgradeType === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                } text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isProcessingDowngrade ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  downgradeType === 'cancel' ? 'Cancel Subscription' : 'Confirm Downgrade'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support & Feedback Modals */}
      <SupportFeedbackModal
        isOpen={showSupportModal}
        onClose={() => {
          setShowSupportModal(false);
          // Refresh messages if on messages tab
          if (activeTab === 'messages') {
            setTimeout(() => loadUserMessages(), 1000);
          }
        }}
        type="support"
      />
      
      <SupportFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          // Refresh messages if on messages tab
          if (activeTab === 'messages') {
            setTimeout(() => loadUserMessages(), 1000);
          }
        }}
        type="feedback"
      />
    </div>
  );
}

export default AccountPage;