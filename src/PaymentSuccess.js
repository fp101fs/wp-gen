import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Crown, Zap, Calendar } from 'lucide-react';
import Header from './Header';
import { useTokenContext } from './contexts/TokenContext';

function PaymentSuccess({ onShowLoginModal }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { refresh, currentTokens, planName, planDisplayName, isUnlimited } = useTokenContext();

  const getTokenResetDate = () => {
    if (planName === 'free') {
      // For free plan, tokens reset monthly on the 1st
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return nextMonth.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else {
      // For paid plans, would typically be based on billing cycle
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      return nextMonth.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  useEffect(() => {
    const session_id = searchParams.get('session_id');
    if (session_id) {
      setSessionId(session_id);
      // Refresh token context to get updated plan info
      refresh();
    } else {
      setError('No session ID found');
    }
    setLoading(false);
  }, [searchParams, refresh]);

  const handleContinue = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <Header onShowLoginModal={onShowLoginModal} />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-red-400 text-xl mb-4">Payment Error</div>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="bg-lime-400 hover:bg-lime-500 text-black font-semibold px-6 py-3 rounded-lg font-semibold"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-lime-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-lime-400/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-neutral-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <Header onShowLoginModal={onShowLoginModal} />
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 shadow-2xl text-center max-w-2xl">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Payment Successful! 🎉
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Welcome to your upgraded plan! Your account has been updated with your new features and tokens.
              </p>
            </div>

            {/* Token Information */}
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 mb-8 border border-green-500/30">
              <div className="flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Your New Token Balance</h2>
              </div>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-green-400 mb-2">
                  {isUnlimited ? 'Unlimited' : currentTokens} 
                  {!isUnlimited && <span className="text-xl text-gray-300"> credits</span>}
                </p>
                <p className="text-lg text-gray-300">
                  {planDisplayName} Plan
                </p>
              </div>
              {!isUnlimited && (
                <div className="flex items-center justify-center text-gray-300">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="text-base">
                    Credits reset on {getTokenResetDate()}
                  </span>
                </div>
              )}
            </div>

            {/* What's Next */}
            <div className="bg-white/10 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center justify-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                What's Next?
              </h2>
              <div className="text-gray-300 space-y-2">
                <p>✅ Your account has been upgraded</p>
                <p>✅ Tokens have been added to your account</p>
                <p>✅ Premium features are now available</p>
                <p>✅ You can start creating unlimited extensions</p>
              </div>
            </div>

            {/* Session Info (for debugging) */}
            {sessionId && (
              <div className="text-xs text-gray-400 mb-6">
                Session ID: {sessionId}
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto"
            >
              <span>Start Creating Extensions</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;