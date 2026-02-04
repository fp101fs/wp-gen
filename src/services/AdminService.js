import { supabase } from '../supabaseClient';

export const adminService = {
  // Check if current user is admin
  async isCurrentUserAdmin() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        // If it's a "no rows returned" error, user is not admin
        if (error.code === 'PGRST116') {
          return false;
        }
        // For other errors (like 406), assume not admin for safety
        return false;
      }

      return data?.is_admin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Get all users with stats (admin only)
  async getAllUsers() {
    try {
      const { data, error } = await supabase.rpc('get_all_users_admin');
      
      if (error) {
        throw error;
      }

      return {
        success: true,
        users: data || []
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch users'
      };
    }
  },

  // Delete user safely with option to keep extensions
  async deleteUser(userId, keepExtensions = true) {
    try {
      const { data, error } = await supabase.rpc('delete_user_safely', {
        target_user_id: userId,
        keep_extensions: keepExtensions
      });

      if (error) {
        throw error;
      }

      // The stored procedure returns JSON, so we need to parse the result
      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }

      return {
        success: true,
        extensionsCount: result.extensions_count,
        extensionsPreserved: result.extensions_preserved
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete user'
      };
    }
  },

  // Make a user an admin (admin only)
  async makeUserAdmin(userId, isAdmin = true) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_admin: isAdmin })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error updating admin status:', error);
      return {
        success: false,
        error: error.message || 'Failed to update admin status'
      };
    }
  },

  // Update user token count (admin only)
  async updateUserTokens(userId, newTokenCount, reason = 'Admin adjustment') {
    try {
      const { data, error } = await supabase.rpc('admin_update_user_tokens', {
        target_user_id: userId,
        new_token_count: newTokenCount,
        reason: reason
      });

      if (error) {
        throw error;
      }

      // The stored procedure returns JSON
      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }

      return {
        success: true,
        oldTokenCount: result.old_token_count,
        newTokenCount: result.new_token_count,
        difference: result.difference,
        message: result.message
      };
    } catch (error) {
      console.error('Error updating user tokens:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user tokens'
      };
    }
  },

  // Get user token history (admin only)
  async getUserTokenHistory(userId, limit = 20) {
    try {
      const { data, error } = await supabase.rpc('admin_get_user_token_history', {
        target_user_id: userId,
        limit_count: limit
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        history: data || []
      };
    } catch (error) {
      console.error('Error getting user token history:', error);
      return {
        success: false,
        error: error.message || 'Failed to get token history'
      };
    }
  },

  // Get user extensions (admin only)
  async getUserExtensions(userId) {
    try {
      const { data, error } = await supabase
        .from('extensions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        extensions: data || []
      };
    } catch (error) {
      console.error('Error getting user extensions:', error);
      return {
        success: false,
        error: error.message || 'Failed to get user extensions'
      };
    }
  },

  // Get model usage statistics (admin only)
  async getModelUsageStats(startDate, endDate) {
    try {
      // Check if current user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.is_admin) {
        throw new Error('Admin privileges required');
      }

      // Get extensions within date range (includes both original extensions and revisions)
      const { data, error } = await supabase
        .from('extensions')
        .select('created_at, ai_model, parent_id')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      // Process the data to extract model usage by day
      const dailyStats = {};

      (data || []).forEach(extension => {
        const date = new Date(extension.created_at).toISOString().split('T')[0];
        const model = extension.ai_model || 'unknown';

        if (!dailyStats[date]) {
          dailyStats[date] = {};
        }

        if (!dailyStats[date][model]) {
          dailyStats[date][model] = 0;
        }

        // Count each extension/revision as 1 unit
        dailyStats[date][model] += 1;
      });

      return {
        success: true,
        stats: dailyStats
      };
    } catch (error) {
      console.error('Error getting model usage stats:', error);
      return {
        success: false,
        error: error.message || 'Failed to get model usage statistics'
      };
    }
  }
};

export default adminService;