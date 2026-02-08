import { supabase } from '../supabaseClient'
import { debugLog, debugError } from '../utils/debugUtils'

/**
 * GitHub Integration Service
 * Handles OAuth connection via Supabase and GitHub API interactions
 */
class GitHubService {
  constructor() {
    this.baseUrl = 'https://api.github.com'
  }

  /**
   * Initiate GitHub OAuth connection via Supabase
   * @returns {Promise<void>}
   */
  async connectGitHub() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'repo',
          redirectTo: window.location.href,
        }
      })

      if (error) {
        debugError('GitHub OAuth error:', error)
        throw new Error(error.message || 'Failed to connect to GitHub')
      }
    } catch (error) {
      debugError('GitHubService.connectGitHub error:', error)
      throw error
    }
  }

  /**
   * Get GitHub access token from Supabase session
   * @returns {Promise<string|null>}
   */
  async getGitHubToken() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        debugError('Error getting session:', error)
        return null
      }

      if (!session?.provider_token) {
        debugLog('No GitHub provider token found in session')
        return null
      }

      return session.provider_token
    } catch (error) {
      debugError('GitHubService.getGitHubToken error:', error)
      return null
    }
  }

  /**
   * Check if user has GitHub connected
   * @returns {Promise<boolean>}
   */
  async isGitHubConnected() {
    const token = await this.getGitHubToken()
    return !!token
  }

  /**
   * Get authenticated GitHub user info
   * @returns {Promise<Object|null>}
   */
  async getGitHubUser() {
    try {
      const token = await this.getGitHubToken()
      if (!token) return null

      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('GitHub connection expired. Please reconnect.')
        }
        throw new Error('Failed to get GitHub user')
      }

      return await response.json()
    } catch (error) {
      debugError('GitHubService.getGitHubUser error:', error)
      throw error
    }
  }

  /**
   * Fetch user's repositories with push access
   * @returns {Promise<Array>}
   */
  async getRepositories() {
    try {
      const token = await this.getGitHubToken()
      if (!token) {
        throw new Error('Not connected to GitHub')
      }

      const response = await fetch(
        `${this.baseUrl}/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('GitHub connection expired. Please reconnect.')
        }
        throw new Error('Failed to fetch repositories')
      }

      const repos = await response.json()

      // Filter to only repos where user has push permission
      return repos.filter(repo => repo.permissions?.push).map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        defaultBranch: repo.default_branch,
        url: repo.html_url
      }))
    } catch (error) {
      debugError('GitHubService.getRepositories error:', error)
      throw error
    }
  }

  /**
   * Push files to a GitHub repository
   * @param {Object} files - Object with filename as key, content as value
   * @param {string} repoFullName - Full repository name (owner/repo)
   * @param {string} commitMessage - Commit message
   * @param {string} branch - Branch to push to (defaults to main)
   * @returns {Promise<Object>}
   */
  async pushFiles(files, repoFullName, commitMessage, branch = 'main') {
    try {
      const token = await this.getGitHubToken()
      if (!token) {
        throw new Error('Not connected to GitHub')
      }

      const results = {
        success: [],
        failed: []
      }

      // Push each file using the Contents API
      for (const [filename, content] of Object.entries(files)) {
        try {
          // Skip instructions file
          if (filename === 'instructions') continue

          // First, try to get the file to check if it exists (for updating)
          let sha = null
          try {
            const getResponse = await fetch(
              `${this.baseUrl}/repos/${repoFullName}/contents/${filename}?ref=${branch}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/vnd.github.v3+json'
                }
              }
            )
            if (getResponse.ok) {
              const existingFile = await getResponse.json()
              sha = existingFile.sha
            }
          } catch (e) {
            // File doesn't exist, that's fine
          }

          // Create or update the file
          const body = {
            message: commitMessage,
            content: btoa(unescape(encodeURIComponent(content))),
            branch
          }

          if (sha) {
            body.sha = sha
          }

          const response = await fetch(
            `${this.baseUrl}/repos/${repoFullName}/contents/${filename}`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
            }
          )

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP ${response.status}`)
          }

          results.success.push(filename)
        } catch (fileError) {
          debugError(`Failed to push ${filename}:`, fileError)
          results.failed.push({ filename, error: fileError.message })
        }
      }

      if (results.failed.length > 0 && results.success.length === 0) {
        throw new Error(`Failed to push files: ${results.failed.map(f => f.error).join(', ')}`)
      }

      return {
        success: true,
        filesCreated: results.success,
        filesFailed: results.failed,
        repoUrl: `https://github.com/${repoFullName}`
      }
    } catch (error) {
      debugError('GitHubService.pushFiles error:', error)

      // Handle specific error cases
      if (error.message?.includes('401') || error.message?.includes('expired')) {
        throw new Error('GitHub connection expired. Please reconnect.')
      }
      if (error.message?.includes('403')) {
        throw new Error("You don't have push access to this repository.")
      }

      throw error
    }
  }
}

export const gitHubService = new GitHubService()
export default gitHubService
