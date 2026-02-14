import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Users, Shield, AlertTriangle, CheckCircle, XCircle, Coins, History, MessageSquare, HelpCircle, Send, ExternalLink, Filter, Mail, Chrome, TestTube, BarChart3, Calendar, X, DollarSign } from 'lucide-react';
import { adminService } from './services/AdminService';
import { supabase } from './supabaseClient';
import Header from './Header';
import useDocumentTitle from './hooks/useDocumentTitle';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper function to get auth provider icon and color
const getAuthProviderIcon = (provider) => {
  switch (provider) {
    case 'google':
      return { Icon: Chrome, color: 'text-red-400', title: 'Google OAuth' };
    case 'github':
      return { Icon: Users, color: 'text-gray-400', title: 'GitHub OAuth' };
    case 'email':
    default:
      return { Icon: Mail, color: 'text-blue-400', title: 'Email/Password' };
  }
};

function AdminPage({ onShowLoginModal }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Set page title
  useDocumentTitle('Admin Dashboard - Kromio.ai');
  const [activeTab, setActiveTab] = useState('users');
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [tokenModal, setTokenModal] = useState({ isOpen: false, user: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [newTokenCount, setNewTokenCount] = useState('');
  const [isUpdatingTokens, setIsUpdatingTokens] = useState(false);

  // Messages state
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageFilter, setMessageFilter] = useState('all'); // 'all', 'support', 'feedback', 'open', 'replied'
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  
  // Welcome email testing states (TEMPORARY - remove after testing)
  const [testEmail, setTestEmail] = useState('');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState(null);

  // User extensions modal states
  const [userExtensionsModal, setUserExtensionsModal] = useState({ isOpen: false, user: null, extensions: [], loading: false });

  // Stats states
  const [statsData, setStatsData] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsDateRange, setStatsDateRange] = useState(30); // Last 30 days by default

  // Costs states
  const [costsData, setCostsData] = useState([]);
  const [costsLoading, setCostsLoading] = useState(false);
  const [costsSortBy, setCostsSortBy] = useState('created_at'); // 'created_at' or 'cost_usd'

  const navigate = useNavigate();

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/');
          return;
        }

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error || !profile?.is_admin) {
          navigate('/');
          return;
        }

        setIsAdmin(true);
        loadUsers();
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      }
    };

    checkAdminStatus();
  }, [navigate]);

  // Load messages when component mounts
  useEffect(() => {
    if (isAdmin) {
      loadMessages();
    }
  }, [isAdmin]);

  // Reload messages when filter changes
  useEffect(() => {
    if (isAdmin) {
      loadMessages();
    }
  }, [messageFilter, isAdmin]);

  // Load stats data when stats tab is active
  useEffect(() => {
    if (isAdmin && activeTab === 'stats') {
      loadStatsData();
    }
  }, [isAdmin, activeTab, statsDateRange]);

  // Load costs data when costs tab is active
  useEffect(() => {
    if (isAdmin && activeTab === 'costs') {
      loadCostsData();
    }
  }, [isAdmin, activeTab, costsSortBy]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await adminService.getAllUsers();
      if (result.success) {
        setUsers(result.users || []);
      } else {
        console.error('Failed to load users:', result.error);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
    setLoading(false);
  };

  const loadMessages = async () => {
    setMessagesLoading(true);
    try {
      // Use RPC function to get messages with proper user data
      const { data, error } = await supabase.rpc('get_admin_messages', {
        filter_type: messageFilter
      });

      if (error) {
        console.error('Error loading messages:', error);
        showToast('Failed to load messages', 'error');
      } else {
        // Transform the data to match the expected structure
        const transformedMessages = (data || []).map(message => ({
          id: message.id,
          user_id: message.user_id,
          extension_id: message.extension_id,
          type: message.type,
          subject: message.subject,
          message: message.message,
          status: message.status,
          admin_reply: message.admin_reply,
          replied_at: message.replied_at,
          created_at: message.created_at,
          updated_at: message.updated_at,
          user_profiles: {
            email: message.user_email,
            full_name: message.user_full_name
          },
          extensions: message.extension_name ? { name: message.extension_name } : null
        }));
        setMessages(transformedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      showToast('Failed to load messages', 'error');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleReplyToMessage = async (messageId, reply) => {
    if (!reply.trim()) return;
    
    setIsReplying(true);
    try {
      const { error } = await supabase
        .from('user_messages')
        .update({
          admin_reply: reply.trim(),
          replied_at: new Date().toISOString(),
          status: 'replied'
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error replying to message:', error);
        showToast('Failed to send reply', 'error');
      } else {
        showToast('Reply sent successfully', 'success');
        setReplyingTo(null);
        setReplyText('');
        loadMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error replying to message:', error);
      showToast('Failed to send reply', 'error');
    } finally {
      setIsReplying(false);
    }
  };

  const getFilteredMessageCount = () => {
    return messages.length;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // TEMPORARY TESTING FUNCTIONS - Remove after testing!
  const resetWelcomeEmailFlag = async (email) => {
    setTestEmailLoading(true);
    setTestEmailStatus(null);
    
    try {
      const { data, error } = await supabase.rpc('reset_welcome_email_flag', {
        user_email: email.trim()
      });

      if (error) {
        console.error('Error resetting welcome email flag:', error);
        setTestEmailStatus({ success: false, message: error.message });
        showToast('Failed to reset welcome email flag', 'error');
        return;
      }

      const result = typeof data === 'string' ? JSON.parse(data) : data;
      setTestEmailStatus(result);
      
      if (result.success) {
        showToast('Welcome email flag reset successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to reset welcome email flag', 'error');
      }
    } catch (error) {
      console.error('Error calling reset function:', error);
      setTestEmailStatus({ success: false, message: error.message });
      showToast('Error calling reset function', 'error');
    } finally {
      setTestEmailLoading(false);
    }
  };

  const checkWelcomeEmailStatus = async (email) => {
    setTestEmailLoading(true);
    setTestEmailStatus(null);
    
    try {
      const { data, error } = await supabase.rpc('check_welcome_email_status', {
        user_email: email.trim()
      });

      if (error) {
        console.error('Error checking welcome email status:', error);
        setTestEmailStatus({ success: false, message: error.message });
        showToast('Failed to check welcome email status', 'error');
        return;
      }

      const result = typeof data === 'string' ? JSON.parse(data) : data;
      setTestEmailStatus(result);
      
      if (result.success) {
        showToast('Welcome email status retrieved', 'success');
      } else {
        showToast(result.error || 'Failed to check status', 'error');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setTestEmailStatus({ success: false, message: error.message });
      showToast('Error checking status', 'error');
    } finally {
      setTestEmailLoading(false);
    }
  };

  const testWelcomeEmailAPI = async (email, name = '') => {
    setTestEmailLoading(true);
    setTestEmailStatus(null);
    
    try {
      console.log('🧪 Testing welcome email API directly...');
      const response = await fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          name: name || 'Test User',
          user_id: 'test-' + Date.now() // Unique test user ID
        }),
      });

      let result;
      const responseText = await response.text();
      
      // Try to parse as JSON, fallback to text if it fails
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('API returned non-JSON response:', responseText);
        setTestEmailStatus({ 
          success: false, 
          error: 'Server returned invalid response',
          details: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
          raw_response: responseText
        });
        showToast('API returned invalid response - check console for details', 'error');
        return;
      }
      
      if (!response.ok) {
        setTestEmailStatus({ 
          success: false, 
          error: result.error || `HTTP ${response.status}`,
          details: result.details 
        });
        showToast(`API test failed: ${result.error}`, 'error');
        return;
      }

      setTestEmailStatus({ 
        success: true, 
        message: result.already_sent ? 'Email was already sent (deduplication worked)' : 'Welcome email sent successfully!',
        emailId: result.emailId,
        already_sent: result.already_sent,
        api_response: result
      });
      
      if (result.already_sent) {
        showToast('Email deduplication working - email was already sent', 'success');
      } else {
        showToast('Welcome email sent successfully via API!', 'success');
      }
      
    } catch (error) {
      console.error('Error testing welcome email API:', error);
      setTestEmailStatus({ 
        success: false, 
        error: error.message,
        message: 'Network or API error occurred'
      });
      showToast('Error testing welcome email API', 'error');
    } finally {
      setTestEmailLoading(false);
    }
  };


  // Modal handlers
  const openDeleteModal = (user) => {
    setDeleteModal({ isOpen: true, user });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, user: null });
  };

  const openTokenModal = (user) => {
    setTokenModal({ isOpen: true, user });
    setNewTokenCount(user.current_tokens?.toString() || '0');
  };

  const closeTokenModal = () => {
    setTokenModal({ isOpen: false, user: null });
  };

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;
    
    setIsDeleting(true);
    try {
      const result = await adminService.deleteUser(deleteModal.user.id);
      if (result.success) {
        showToast('User deleted successfully', 'success');
        loadUsers(); // Refresh the list
        closeDeleteModal();
      } else {
        showToast(result.error || 'Failed to delete user', 'error');
      }
    } catch (error) {
      showToast('Failed to delete user', 'error');
    }
    setIsDeleting(false);
  };

  const handleTokenUpdate = (updatedUser) => {
    // Update the user in the list
    setUsers(users.map(user =>
      user.id === updatedUser.id ? { ...user, ...updatedUser } : user
    ));
    showToast('Tokens updated successfully', 'success');
    closeTokenModal();
  };

  const handleSaveTokens = async () => {
    if (!tokenModal.user) return;

    setIsUpdatingTokens(true);
    try {
      const result = await adminService.updateUserTokens(
        tokenModal.user.id,
        parseInt(newTokenCount, 10),
        'Admin adjustment'
      );

      if (result.success) {
        handleTokenUpdate({ ...tokenModal.user, current_tokens: result.newTokenCount });
      } else {
        showToast(result.error || 'Failed to update tokens', 'error');
      }
    } catch (error) {
      showToast('Failed to update tokens', 'error');
    }
    setIsUpdatingTokens(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  // Handle opening user extensions modal
  const openUserExtensionsModal = async (user) => {
    setUserExtensionsModal({ isOpen: true, user, extensions: [], loading: true });

    try {
      const result = await adminService.getUserExtensions(user.id);
      if (result.success) {
        setUserExtensionsModal(prev => ({ ...prev, extensions: result.extensions, loading: false }));
      } else {
        setUserExtensionsModal(prev => ({ ...prev, loading: false }));
        showToast(result.error || 'Failed to load user extensions', 'error');
      }
    } catch (error) {
      setUserExtensionsModal(prev => ({ ...prev, loading: false }));
      showToast('Error loading user extensions', 'error');
    }
  };

  const closeUserExtensionsModal = () => {
    setUserExtensionsModal({ isOpen: false, user: null, extensions: [], loading: false });
  };

  // Load stats data
  const loadStatsData = async () => {
    setStatsLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - (statsDateRange * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

      const result = await adminService.getModelUsageStats(startDate, endDate);
      if (result.success) {
        // Transform data for chart
        const chartData = [];
        const allDates = [];

        // Generate all dates in range
        for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
          allDates.push(new Date(d).toISOString().split('T')[0]);
        }

        // Create chart data with all dates
        allDates.forEach(date => {
          const dayData = { date: date.slice(5) }; // Show MM-DD format
          const stats = result.stats[date] || {};

          // Add each model's count for this day
          dayData['Claude Opus 4.6'] = (stats['claude-opus'] || 0) + (stats['claude-opus-4-6'] || 0);
          dayData['Claude Sonnet 4.5'] = stats['claude-sonnet-4-5'] || 0;
          dayData['Claude Sonnet 4'] = stats['claude'] || 0;
          dayData['Gemini 3 Pro'] = stats['gemini'] || 0;
          dayData['ChatGPT 4o'] = stats['chatgpt'] || 0;
          dayData['Unknown/Other'] = stats['unknown'] || 0;

          chartData.push(dayData);
        });

        setStatsData(chartData);
      } else {
        showToast(result.error || 'Failed to load usage statistics', 'error');
      }
    } catch (error) {
      showToast('Error loading usage statistics', 'error');
    }
    setStatsLoading(false);
  };

  // Load costs data
  const loadCostsData = async () => {
    setCostsLoading(true);
    try {
      // Query extensions with cost data (no join - FK relationship doesn't exist)
      const { data: extensionsData, error: extensionsError } = await supabase
        .from('extensions')
        .select(`
          id,
          name,
          platform,
          ai_model,
          input_tokens,
          output_tokens,
          cost_usd,
          created_at,
          user_id
        `)
        .order(costsSortBy, { ascending: false });

      if (extensionsError) {
        console.error('Error loading costs data:', extensionsError);
        showToast('Failed to load costs data', 'error');
        setCostsLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(extensionsData?.map(e => e.user_id).filter(Boolean))];

      // Fetch user profiles for those IDs
      let userProfiles = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        if (profiles) {
          userProfiles = profiles.reduce((acc, p) => {
            acc[p.id] = { email: p.email, full_name: p.full_name };
            return acc;
          }, {});
        }
      }

      // Merge user profiles into extensions data
      const mergedData = (extensionsData || []).map(ext => ({
        ...ext,
        user_profiles: userProfiles[ext.user_id] || null
      }));

      setCostsData(mergedData);
    } catch (error) {
      console.error('Error loading costs data:', error);
      showToast('Failed to load costs data', 'error');
    }
    setCostsLoading(false);
  };

  // Calculate totals for costs
  const calculateCostsTotals = () => {
    return costsData.reduce((acc, item) => {
      acc.totalInputTokens += item.input_tokens || 0;
      acc.totalOutputTokens += item.output_tokens || 0;
      acc.totalCost += item.cost_usd || 0;
      acc.count++;
      return acc;
    }, { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0, count: 0 });
  };

  // Format model name for display
  const formatModelName = (model) => {
    switch (model) {
      case 'claude-opus-4-6':
      case 'claude-opus': return 'Claude Opus 4.6';
      case 'claude-sonnet-4-5': return 'Claude Sonnet 4.5';
      case 'gemini-3-pro':
      case 'gemini-pro': return 'Gemini 3 Pro';
      case 'gemini-3-flash':
      case 'gemini-flash': return 'Gemini 3 Flash';
      default: return model || 'Unknown';
    }
  };

  // Format platform name for display
  const formatPlatformName = (platform) => {
    switch (platform) {
      case 'wordpress': return 'WordPress';
      case 'shopify': return 'Shopify';
      case 'figma': return 'Figma';
      case 'blender': return 'Blender';
      case 'sheets-addon': return 'Sheets Add-on';
      default: return platform || 'Unknown';
    }
  };

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <Header onShowLoginModal={onShowLoginModal} />
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-purple-400 mr-3" />
              <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
            </div>
          </div>
          <p className="text-gray-300">Manage users and their data</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex border-b border-gray-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 sm:px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Users</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-3 sm:px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'messages'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`px-3 sm:px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'test'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TestTube className="w-4 h-4" />
                <span>Test Emails</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('costs')}
              className={`px-3 sm:px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'costs'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Costs</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 sm:px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Stats</span>
              </div>
            </button>
          </div>
        </div>

        {activeTab === 'users' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-purple-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">All Users ({users.length})</h2>
              </div>
              <button
                onClick={loadUsers}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* Membership Plan Statistics */}
            {users.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-gray-300 font-medium">Plan Distribution:</span>
                  {(() => {
                    const planCounts = users.reduce((acc, user) => {
                      const plan = user.plan_name || 'free';
                      acc[plan] = (acc[plan] || 0) + 1;
                      return acc;
                    }, {});

                    return (
                      <>
                        <span className="text-gray-400">
                          <span className="text-green-400 font-medium">Free:</span> {planCounts.free || 0}
                        </span>
                        <span className="text-gray-400">
                          <span className="text-blue-400 font-medium">Pro:</span> {planCounts.pro || 0}
                        </span>
                        <span className="text-gray-400">
                          <span className="text-purple-400 font-medium">Max:</span> {planCounts.unlimited || 0}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="text-white ml-3">Loading users...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr className="text-left">
                    <th className="px-3 py-4 text-gray-300 font-medium">User</th>
                    <th className="px-2 py-4 text-gray-300 font-medium text-center">Plan</th>
                    <th className="px-2 py-4 text-gray-300 font-medium hidden sm:table-cell">Tokens</th>
                    <th className="px-2 py-4 text-gray-300 font-medium text-center">Ext.</th>
                    <th className="px-2 py-4 text-gray-300 font-medium text-center">Rev.</th>
                    <th className="px-2 py-4 text-gray-300 font-medium hidden md:table-cell">Created</th>
                    <th className="px-2 py-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-3 py-4">
                        <div>
                          <div className="flex items-center">
                            <button
                              onClick={() => openUserExtensionsModal(user)}
                              className="text-white font-medium text-sm truncate max-w-[120px] md:max-w-none hover:text-purple-300 transition-colors cursor-pointer text-left"
                              title={`Click to view extensions for ${user.email}`}
                            >
                              {user.email}
                            </button>
                            {user.is_admin && (
                              <Shield className="w-3 h-3 text-yellow-400 ml-1 flex-shrink-0" title="Admin" />
                            )}
                          </div>
                          <div className="text-gray-400 text-xs hidden md:block">{user.full_name}</div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className={`px-1 py-1 rounded text-xs font-medium ${
                          user.plan_name === 'free' ? 'bg-gray-700 text-gray-300' :
                          user.plan_name === 'pro' ? 'bg-blue-700 text-blue-300' :
                          'bg-purple-700 text-purple-300'
                        }`}>
                          {user.plan_name === 'unlimited' ? 'Max' : user.plan_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-2 py-4 hidden sm:table-cell">
                        <div className="text-white text-sm">
                          {user.current_tokens}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {user.total_used || 0} used
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className="text-white font-medium text-sm">{user.extensions_count || 0}</span>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className="text-white font-medium text-sm">0</span>
                      </td>
                      <td className="px-2 py-4 hidden md:table-cell">
                        <div className="text-white text-xs">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openTokenModal(user)}
                            className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-lg transition-colors"
                            title="Manage tokens"
                          >
                            <Coins className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {activeTab === 'messages' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MessageSquare className="w-6 h-6 text-purple-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Support & Feedback Messages ({getFilteredMessageCount()})</h2>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={messageFilter}
                  onChange={(e) => setMessageFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Messages</option>
                  <option value="support">Support Only</option>
                  <option value="feedback">Feedback Only</option>
                  <option value="open">Open</option>
                  <option value="replied">Replied</option>
                </select>
                <button
                  onClick={loadMessages}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
          
          {messagesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="text-white ml-3">Loading messages...</span>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No messages found</p>
                </div>
              ) : (
                <div className="space-y-4 p-6">
                  {messages.map((message) => (
                    <div key={message.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              message.type === 'support' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {message.type === 'support' ? 'Support' : 'Feedback'}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(message.status)}`}>
                              {message.status}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                          
                          <div className="mb-2">
                            <span className="text-white font-medium">{message.user_profiles?.email}</span>
                            {message.user_profiles?.full_name && (
                              <span className="text-gray-300 ml-2">({message.user_profiles.full_name})</span>
                            )}
                          </div>
                          
                          {message.extensions && (
                            <div className="text-sm text-blue-400 mb-2">
                              Extension: {message.extensions.name}
                            </div>
                          )}
                          
                          {message.subject && (
                            <div className="text-white font-medium mb-2">
                              {message.subject}
                            </div>
                          )}
                          
                          <div className="text-gray-300 whitespace-pre-wrap">
                            {message.message}
                          </div>
                        </div>
                      </div>
                      
                      {message.admin_reply && (
                        <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-green-400 font-medium text-sm">Admin Reply</span>
                            <span className="text-gray-400 text-xs ml-2">
                              {formatDate(message.replied_at)}
                            </span>
                          </div>
                          <div className="text-gray-200 whitespace-pre-wrap">
                            {message.admin_reply}
                          </div>
                        </div>
                      )}
                      
                      {!message.admin_reply && (
                        <div className="mt-4 flex items-center space-x-3">
                          {replyingTo === message.id ? (
                            <div className="flex-1 space-y-3">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply..."
                                rows={3}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleReplyToMessage(message.id, replyText)}
                                  disabled={isReplying || !replyText.trim()}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                                >
                                  {isReplying ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      <span>Sending...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-4 h-4" />
                                      <span>Send Reply</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText('');
                                  }}
                                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReplyingTo(message.id)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Reply</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {activeTab === 'test' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TestTube className="w-6 h-6 text-purple-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Welcome Email Testing</h2>
              </div>
              <div className="bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/20">
                <span className="text-yellow-400 text-sm font-medium">⚠️ TEMPORARY - Remove after testing</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Email Input Section */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Test Welcome Email System</h3>
              <p className="text-gray-300 mb-4">
                Use this to reset the welcome email flag for existing users so you can test the welcome email system.
              </p>
              
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="testEmail" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email address to test..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => checkWelcomeEmailStatus(testEmail)}
                    disabled={!testEmail.trim() || testEmailLoading}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {testEmailLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <HelpCircle className="w-4 h-4" />
                    )}
                    <span>Check Status</span>
                  </button>
                  <button
                    onClick={() => resetWelcomeEmailFlag(testEmail)}
                    disabled={!testEmail.trim() || testEmailLoading}
                    className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {testEmailLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                    <span>Reset Flag</span>
                  </button>
                  <button
                    onClick={() => testWelcomeEmailAPI(testEmail)}
                    disabled={!testEmail.trim() || testEmailLoading}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {testEmailLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Test API</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Status Display */}
            {testEmailStatus && (
              <div className={`rounded-lg p-6 border ${
                testEmailStatus.success 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                <div className="flex items-center mb-3">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    testEmailStatus.success ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <h4 className={`font-semibold ${
                    testEmailStatus.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {testEmailStatus.success ? 'Success' : 'Error'}
                  </h4>
                </div>
                
                {testEmailStatus.success ? (
                  <div className="space-y-2 text-gray-200">
                    {testEmailStatus.email && (
                      <p><strong>Email:</strong> {testEmailStatus.email}</p>
                    )}
                    {testEmailStatus.user_id && (
                      <p><strong>User ID:</strong> {testEmailStatus.user_id}</p>
                    )}
                    {testEmailStatus.welcome_email_sent !== undefined && (
                      <p><strong>Welcome Email Sent:</strong> {testEmailStatus.welcome_email_sent ? 'Yes' : 'No'}</p>
                    )}
                    {testEmailStatus.welcome_email_sent_at && (
                      <p><strong>Sent At:</strong> {formatDate(testEmailStatus.welcome_email_sent_at)}</p>
                    )}
                    {testEmailStatus.message && (
                      <p className="text-green-300 mt-2">{testEmailStatus.message}</p>
                    )}
                    {testEmailStatus.emailId && (
                      <p><strong>Email ID:</strong> {testEmailStatus.emailId}</p>
                    )}
                    {testEmailStatus.already_sent !== undefined && (
                      <p><strong>Already Sent:</strong> {testEmailStatus.already_sent ? 'Yes (deduplication working!)' : 'No (new email sent)'}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-red-300">
                    <p className="font-semibold">{testEmailStatus.error || testEmailStatus.message}</p>
                    {testEmailStatus.details && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Server Response:</p>
                        <pre className="text-xs bg-red-900/20 p-3 rounded border border-red-500/30 overflow-auto max-h-40">
                          {testEmailStatus.details}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/20">
              <h4 className="text-blue-400 font-semibold mb-3">Testing Instructions</h4>
              <div className="text-gray-300 space-y-2">
                <p><strong>1.</strong> Enter your email address above</p>
                <p><strong>2.</strong> Click "Check Status" to see if welcome email was already sent</p>
                <p><strong>3.</strong> Click "Reset Flag" to allow welcome email to be sent again</p>
                <p><strong>4.</strong> Click "Test API" to directly test the welcome email API (bypasses database trigger issues)</p>
                <p><strong>5.</strong> Check your inbox for the welcome email (should only receive 1, not 8!)</p>
                <p className="text-yellow-300 mt-4"><strong>Note:</strong> The "Test API" button tests the email system directly and will help verify if our deduplication fixes work.</p>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'stats' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="w-6 h-6 text-purple-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Model Usage Statistics</h2>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={statsDateRange}
                  onChange={(e) => setStatsDateRange(parseInt(e.target.value))}
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
                <button
                  onClick={loadStatsData}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {statsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="text-white ml-3">Loading statistics...</span>
            </div>
          ) : (
            <div className="p-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Daily Extensions & Revisions Created by Model</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Claude Opus 4.1"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="Claude Sonnet 4.5"
                        stroke="#06B6D4"
                        strokeWidth={2}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="Claude Sonnet 4"
                        stroke="#10B981"
                        strokeWidth={2}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="Gemini 3 Pro"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="ChatGPT 4o"
                        stroke="#EF4444"
                        strokeWidth={2}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="Unknown/Other"
                        stroke="#6B7280"
                        strokeWidth={2}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {statsData.length === 0 && !statsLoading && (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No usage data found for the selected period</p>
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {activeTab === 'costs' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="w-6 h-6 text-purple-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Generation Costs ({costsData.length})</h2>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={costsSortBy}
                  onChange={(e) => setCostsSortBy(e.target.value)}
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="created_at">Sort by Date</option>
                  <option value="cost_usd">Sort by Cost</option>
                </select>
                <button
                  onClick={loadCostsData}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            {costsData.length > 0 && (() => {
              const totals = calculateCostsTotals();
              return (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-gray-300 font-medium">Totals:</span>
                    <span className="text-gray-400">
                      <span className="text-blue-400 font-medium">Generations:</span> {totals.count}
                    </span>
                    <span className="text-gray-400">
                      <span className="text-cyan-400 font-medium">Input Tokens:</span> {totals.totalInputTokens.toLocaleString()}
                    </span>
                    <span className="text-gray-400">
                      <span className="text-purple-400 font-medium">Output Tokens:</span> {totals.totalOutputTokens.toLocaleString()}
                    </span>
                    <span className="text-gray-400">
                      <span className="text-green-400 font-medium">Total Cost:</span> ${totals.totalCost.toFixed(4)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {costsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="text-white ml-3">Loading costs data...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr className="text-left">
                    <th className="px-3 py-4 text-gray-300 font-medium">Date/Time</th>
                    <th className="px-2 py-4 text-gray-300 font-medium">User</th>
                    <th className="px-2 py-4 text-gray-300 font-medium">Plugin Name</th>
                    <th className="px-2 py-4 text-gray-300 font-medium text-center">Platform</th>
                    <th className="px-2 py-4 text-gray-300 font-medium">Model</th>
                    <th className="px-2 py-4 text-gray-300 font-medium text-right">Input</th>
                    <th className="px-2 py-4 text-gray-300 font-medium text-right">Output</th>
                    <th className="px-2 py-4 text-gray-300 font-medium text-right">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {costsData.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-3 py-4">
                        <div className="text-white text-sm">
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="text-white text-sm truncate max-w-[150px]" title={item.user_profiles?.email}>
                          {item.user_profiles?.email || 'Unknown'}
                        </div>
                        {item.user_profiles?.full_name && (
                          <div className="text-gray-400 text-xs truncate max-w-[150px]">
                            {item.user_profiles.full_name}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-4">
                        <div className="text-white text-sm truncate max-w-[200px]" title={item.name}>
                          {item.name}
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.platform === 'wordpress' ? 'bg-blue-700 text-blue-300' :
                          item.platform === 'shopify' ? 'bg-green-700 text-green-300' :
                          item.platform === 'figma' ? 'bg-purple-700 text-purple-300' :
                          item.platform === 'blender' ? 'bg-orange-700 text-orange-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {formatPlatformName(item.platform)}
                        </span>
                      </td>
                      <td className="px-2 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          (item.ai_model === 'claude-opus' || item.ai_model === 'claude-opus-4-6') ? 'bg-purple-700 text-purple-300' :
                          item.ai_model === 'claude-sonnet-4-5' ? 'bg-cyan-700 text-cyan-300' :
                          (item.ai_model === 'gemini-pro' || item.ai_model === 'gemini-3-pro') ? 'bg-yellow-700 text-yellow-300' :
                          (item.ai_model === 'gemini-flash' || item.ai_model === 'gemini-3-flash') ? 'bg-amber-700 text-amber-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {formatModelName(item.ai_model)}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-right">
                        <span className="text-cyan-400 text-sm">
                          {item.input_tokens ? item.input_tokens.toLocaleString() : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-right">
                        <span className="text-purple-400 text-sm">
                          {item.output_tokens ? item.output_tokens.toLocaleString() : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-right">
                        <span className={`text-sm font-medium ${item.cost_usd ? 'text-green-400' : 'text-gray-500'}`}>
                          {item.cost_usd ? `$${item.cost_usd.toFixed(6)}` : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {costsData.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No cost data found</p>
                  <p className="text-gray-500 text-sm mt-2">Cost tracking was recently added. New generations will show cost data.</p>
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </div>

      {/* Delete User Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Delete User</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <strong>{deleteModal.user?.email}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Management Modal */}
      {tokenModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Manage Tokens</h3>
            <p className="text-gray-300 mb-4">
              User: <strong>{tokenModal.user?.email}</strong>
            </p>
            <div className="mb-6">
              <label htmlFor="tokenCount" className="block text-sm font-medium text-gray-300 mb-2">
                Token Count
              </label>
              <input
                id="tokenCount"
                type="number"
                value={newTokenCount}
                onChange={(e) => setNewTokenCount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
              />
              <p className="text-gray-400 text-sm mt-2">
                Current: {tokenModal.user?.current_tokens} tokens
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleSaveTokens}
                disabled={isUpdatingTokens}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isUpdatingTokens ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={closeTokenModal}
                disabled={isUpdatingTokens}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Extensions Modal */}
      {userExtensionsModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-purple-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">
                  Extensions by {userExtensionsModal.user?.email}
                </h3>
              </div>
              <button
                onClick={closeUserExtensionsModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {userExtensionsModal.loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="text-white ml-3">Loading extensions...</span>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto">
                {userExtensionsModal.extensions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-2">No extensions found</div>
                    <p className="text-gray-500 text-sm">This user hasn't created any extensions yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userExtensionsModal.extensions.map((extension) => (
                      <div key={extension.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <a
                              href={`/extension/${extension.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white font-semibold text-lg mb-1 hover:text-purple-300 transition-colors cursor-pointer block"
                            >
                              {extension.name}
                            </a>
                            <p className="text-gray-300 text-sm mb-2">
                              Version {extension.version}
                            </p>
                            {extension.description && (
                              <p className="text-gray-400 text-sm mb-3">
                                {extension.description.length > 200
                                  ? `${extension.description.substring(0, 200)}...`
                                  : extension.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-white text-sm">
                              {new Date(extension.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {new Date(extension.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              extension.is_public
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {extension.is_public ? 'Public' : 'Private'}
                            </span>
                            <span className="text-gray-400 text-xs">
                              ID: {extension.id.slice(0, 8)}...
                            </span>
                          </div>
                          {extension.download_count > 0 && (
                            <div className="text-gray-400 text-xs">
                              {extension.download_count} downloads
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-between items-center">
              <div className="text-gray-400 text-sm">
                Total extensions: {userExtensionsModal.extensions.length}
              </div>
              <button
                onClick={closeUserExtensionsModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}>
            <div className="flex items-center justify-between">
              <span>{toast.message}</span>
              <button
                onClick={hideToast}
                className="ml-4 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;