import React, { useState, useEffect, useRef } from 'react';
import { Zap, Gift, User, Settings, Crown, HelpCircle, Moon, LogOut, Shield, Menu, X, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useTokenContext } from './contexts/TokenContext';
import { adminService } from './services/AdminService';

function Header({ onShowFeaturesModal, onShowLoginModal }) {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const accountPopupRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const { currentTokens, planName, isUnlimited, totalUsed, planDisplayName, showUpgradePromptAction, isSyncing, isLoading, subscriptionPeriodEnd } = useTokenContext();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
      if (session) {
        checkAdminStatus();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setSessionLoading(false);
      if (session) {
        checkAdminStatus();
      } else {
        setIsAdmin(false);
      }
    });

    const handleClickOutside = (event) => {
      if (accountPopupRef.current && !accountPopupRef.current.contains(event.target)) {
        setShowAccountPopup(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkAdminStatus = async () => {
    // Add a small delay for new users to allow profile creation to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    const adminStatus = await adminService.isCurrentUserAdmin();
    setIsAdmin(adminStatus);
  };

  async function signInWithGoogle() {
    // Ensure mobile users stay on mobile version after sign-in
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseUrl = window.location.origin;
    const currentPath = window.location.pathname;
    const redirectUrl = isMobile 
      ? `${baseUrl}${currentPath}` // Force mobile-friendly URL
      : window.location.href;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
  }

  async function signOut(){
    const { error } = await supabase.auth.signOut()
    // Force page refresh to clear all cached state
    window.location.reload()
  }

  const getTimeUntilReset = () => {
    const now = new Date();
    let targetDate;
    let daysUntil;
    
    // For paid plans, use actual subscription period end date if available
    if ((planName === 'pro' || planName === 'unlimited') && subscriptionPeriodEnd) {
      targetDate = new Date(subscriptionPeriodEnd);
      
      // Ensure target date is valid and in the future
      if (!isNaN(targetDate.getTime()) && targetDate > now) {
        daysUntil = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
      } else {
        // Fallback to next month if date is invalid or in past
        targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        daysUntil = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
      }
    } else {
      // For free plan or when no subscription data, use first of next month
      targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      daysUntil = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
    }
    
    if (planName === 'free') {
      return `${daysUntil} days until 8 more credits`;
    } else if (planName === 'pro') {
      return `${daysUntil} days until 150 more credits`;
    } else if (planName === 'unlimited') {
      return `${daysUntil} days until 500 more credits`;
    }
    return '';
  }

  return (
    <nav className="relative z-10 flex items-center justify-between py-4 px-4 sm:px-6 mb-8 sm:mb-12">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <img src="/icons/plugindotnew-logo-dark-lime-177x177.webp" alt="plugin.new" className="block w-6 h-6" />
        <span className="text-xl sm:text-2xl font-light text-white leading-none -mt-0.5">plugin.new</span>
      </button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
        <button onClick={() => {
          navigate('/gallery');
          // Force a re-render by adding timestamp
          window.dispatchEvent(new CustomEvent('forceGalleryRefresh', { detail: { viewMode: 'all' } }));
        }} className="text-gray-300 hover:text-white transition-colors duration-200">Gallery</button>
{session && (
          <button onClick={() => {
            navigate('/my-extensions');
            // Force a re-render by adding timestamp
            window.dispatchEvent(new CustomEvent('forceGalleryRefresh', { detail: { viewMode: 'my' } }));
          }} className="text-gray-300 hover:text-white transition-colors duration-200">My Plugins</button>
        )}
        <button onClick={() => navigate('/learn')} className="text-gray-300 hover:text-white transition-colors duration-200">Learn</button>
        <button onClick={() => navigate('/pricing')} className="text-gray-300 hover:text-white transition-colors duration-200">Pricing</button>
        {isAdmin && (
          <button 
            onClick={() => navigate('/admin')} 
            className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
          >
            <Shield className="w-4 h-4 mr-1" />
            Admin
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {sessionLoading ? (
          // Loading placeholder to prevent layout shift
          <>
            {/* Mobile: Loading placeholder for user button */}
            <div className="md:hidden w-10 h-10 bg-gray-600 rounded-full animate-pulse"></div>
            
            {/* Desktop: Loading placeholder for buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-16 h-8 bg-gray-600 rounded-lg animate-pulse"></div>
              <div className="w-14 h-8 bg-gray-600 rounded-lg animate-pulse"></div>
            </div>
          </>
        ) : !session ? (
          <>
            {/* Mobile: Show Start button - sized to match user button */}
            <button 
              onClick={onShowLoginModal}
              className="md:hidden px-4 py-2 bg-white rounded-lg text-black text-sm font-medium hover:bg-gray-200 transition-colors duration-200 min-w-[60px]"
            >
              Start
            </button>
            
            {/* Desktop: Show both buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={onShowLoginModal}
                className="px-3 sm:px-4 py-2 bg-white/10 rounded-lg text-white text-xs sm:text-sm font-medium hover:bg-white/20 transition-colors duration-200"
              >
                Log in
              </button>
              <button 
                onClick={onShowLoginModal}
                className="px-3 sm:px-4 py-2 bg-white rounded-lg text-black text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Start
              </button>
            </div>
          </>
        ) : (
          <>
            {/* <button className="hidden md:flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white/10 rounded-lg text-white text-xs sm:text-sm font-medium hover:bg-white/20 transition-colors duration-200">
              <Gift className="w-4 h-4" />
              <span>Get free credits</span>
            </button> */}
            <div className="relative" ref={accountPopupRef}>
              <button
                onClick={() => setShowAccountPopup(!showAccountPopup)}
                className="flex items-center justify-center px-2 py-2 rounded-lg text-white text-sm font-medium transition-colors duration-200 min-w-[60px] md:min-w-[auto] md:px-4 md:space-x-2"
              >
                <div 
                  className="w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-black font-bold text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #AFEE14 0%, #9BD912 100%)'
                  }}
                >
                  {session.user.email ? session.user.email[0].toUpperCase() : 'U'}
                </div>
{/* <span className="hidden sm:inline">{session.user.user_metadata?.full_name?.split(' ')[0] || 'User'}</span> */}
              </button>

              {showAccountPopup && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-gray-800 rounded-lg shadow-lg py-2 z-20">
                  {(isSyncing || isLoading) && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <p className="text-white font-medium text-base">
                          {isSyncing ? 'Syncing account...' : 'Loading account...'}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center p-4 border-b border-gray-700">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-lg mr-3"
                      style={{
                        background: 'linear-gradient(135deg, #AFEE14 0%, #9BD912 100%)'
                      }}
                    >
                      {session.user.email ? session.user.email[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{session.user.user_metadata?.full_name || 'User\'s Lovable'}</p>
                      <p className="text-gray-400 text-base">{session.user.email}</p>
                    </div>
                  </div>
                  <div className="p-4 border-b border-gray-700">
                    <div className="mb-3">
                      <p className="text-gray-400 text-base">Current Plan: <span className="text-white font-semibold text-lg">{planDisplayName}</span></p>
                    </div>
                    {planName !== 'unlimited' || (planName === 'unlimited' && !isUnlimited) ? (
                      <div className="mb-3">
                        <p className="text-blue-400 text-base font-medium">{getTimeUntilReset()}</p>
                      </div>
                    ) : null}
                    {planName !== 'unlimited' && (
                      <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center">
                          <Crown className="w-6 h-6 text-yellow-400 mr-2" />
                          <span className="text-white text-lg">
                            {planName === 'free' ? 'Turn Pro' : 'Go Max'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setShowAccountPopup(false);
                            showUpgradePromptAction('Upgrade from account menu');
                          }}
                          className="bg-lime-400 text-black px-4 py-2 rounded-md text-base hover:bg-lime-500 font-semibold"
                        >
                          Upgrade
                        </button>
                      </div>
                    )}
                    <div className="mt-4">
                      <p className="text-gray-400 text-base">Credits Used</p>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                        <div 
                          className="bg-blue-500 h-2.5 rounded-full" 
                          style={{ 
                            width: isUnlimited ? '0%' : `${Math.min((totalUsed / (totalUsed + currentTokens)) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-gray-400 text-sm mt-1">
                        <span>{planDisplayName} Plan</span>
                        <span>{isUnlimited ? 'Unlimited' : `${totalUsed}/${totalUsed + currentTokens}`}</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {isUnlimited 
                          ? 'Unlimited credits available' 
                          : <><span className="text-green-400 font-semibold">{currentTokens}</span> credits remaining</>
                        }
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-4 border-b border-gray-700">
                    <button 
                      onClick={() => {
                        setShowAccountPopup(false);
                        navigate('/account');
                      }}
                      className="flex items-center justify-center space-x-2 bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600"
                    >
                      <Settings className="w-6 h-6" />
                      <span className="text-lg">Settings</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600">
                      <User className="w-6 h-6" />
                      <span className="text-lg">Invite</span>
                    </button>
                  </div>
                  <div className="py-2">
                    {/* <a href="#" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700">
                      <Gift className="w-5 h-5 mr-3" />
                      Get free credits
                    </a> */}
                    <button
                      onClick={() => {
                        setShowAccountPopup(false);
                        navigate('/account', { state: { activeTab: 'messages' } });
                      }}
                      className="flex items-center w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700"
                    >
                      <MessageSquare className="w-6 h-6 mr-3" />
                      <span className="text-lg">Support</span>
                    </button>
                    <a href="/learn#privacy" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700">
                      <Shield className="w-6 h-6 mr-3" />
                      <span className="text-lg">Privacy</span>
                    </a>
                    <button
                      onClick={signOut}
                      className="flex items-center w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700"
                    >
                      <LogOut className="w-6 h-6 mr-3" />
                      <span className="text-lg">Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Mobile Hamburger Menu - Right Side */}
        {!sessionLoading && (
          <div className="md:hidden relative" ref={mobileMenuRef}>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="text-white hover:text-gray-300 transition-colors duration-200 p-2"
            aria-label="Toggle navigation menu"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          {showMobileMenu && (
            <div className="absolute right-0 top-12 w-56 bg-gray-800 rounded-lg shadow-lg py-3 z-20">
              <button 
                onClick={() => {
                  navigate('/gallery');
                  window.dispatchEvent(new CustomEvent('forceGalleryRefresh', { detail: { viewMode: 'all' } }));
                  setShowMobileMenu(false);
                }} 
                className="w-full text-left px-6 py-3 text-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
              >
                Gallery
              </button>
{session && (
                <button
                  onClick={() => {
                    navigate('/my-extensions');
                    window.dispatchEvent(new CustomEvent('forceGalleryRefresh', { detail: { viewMode: 'my' } }));
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-6 py-3 text-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  My Plugins
                </button>
              )}
              <button 
                onClick={() => {
                  navigate('/learn');
                  setShowMobileMenu(false);
                }} 
                className="w-full text-left px-6 py-3 text-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
              >
                Learn
              </button>
              <button 
                onClick={() => {
                  navigate('/pricing');
                  setShowMobileMenu(false);
                }} 
                className="w-full text-left px-6 py-3 text-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
              >
                Pricing
              </button>
              {isAdmin && (
                <button 
                  onClick={() => {
                    navigate('/admin');
                    setShowMobileMenu(false);
                  }} 
                  className="w-full text-left px-6 py-3 text-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center"
                >
                  <Shield className="w-5 h-5 mr-3" />
                  Admin
                </button>
              )}
              {!session && (
                <>
                  <div className="border-t border-gray-700 my-3"></div>
                  <button
                    onClick={() => {
                      onShowLoginModal();
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-6 py-3 text-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                  >
                    Log in
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        )}
      </div>
    </nav>
  );
}

export default Header;