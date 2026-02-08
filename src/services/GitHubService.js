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
   * Push files to a GitHub repository using Git Data API (single atomic commit)
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

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }

      // 1. Get current branch ref
      const refResponse = await fetch(
        `${this.baseUrl}/repos/${repoFullName}/git/ref/heads/${branch}`,
        { headers }
      )
      if (!refResponse.ok) {
        const errorData = await refResponse.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to get branch ref: HTTP ${refResponse.status}`)
      }
      const refData = await refResponse.json()
      const currentCommitSha = refData.object.sha

      // 2. Get base tree from current commit
      const commitResponse = await fetch(
        `${this.baseUrl}/repos/${repoFullName}/git/commits/${currentCommitSha}`,
        { headers }
      )
      if (!commitResponse.ok) {
        throw new Error(`Failed to get commit: HTTP ${commitResponse.status}`)
      }
      const commitData = await commitResponse.json()
      const baseTreeSha = commitData.tree.sha

      // 3. Create blobs for all files (in parallel)
      const filesToPush = Object.entries(files).filter(([name]) => name !== 'instructions')
      const treeItems = await Promise.all(
        filesToPush.map(async ([path, content]) => {
          const blobResponse = await fetch(
            `${this.baseUrl}/repos/${repoFullName}/git/blobs`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({ content, encoding: 'utf-8' })
            }
          )
          if (!blobResponse.ok) {
            throw new Error(`Failed to create blob for ${path}: HTTP ${blobResponse.status}`)
          }
          const blob = await blobResponse.json()
          return { path, mode: '100644', type: 'blob', sha: blob.sha }
        })
      )

      // 4. Create new tree with all files
      const treeResponse = await fetch(
        `${this.baseUrl}/repos/${repoFullName}/git/trees`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems })
        }
      )
      if (!treeResponse.ok) {
        throw new Error(`Failed to create tree: HTTP ${treeResponse.status}`)
      }
      const newTree = await treeResponse.json()

      // 5. Create single commit with all files
      const newCommitResponse = await fetch(
        `${this.baseUrl}/repos/${repoFullName}/git/commits`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: commitMessage,
            tree: newTree.sha,
            parents: [currentCommitSha]
          })
        }
      )
      if (!newCommitResponse.ok) {
        throw new Error(`Failed to create commit: HTTP ${newCommitResponse.status}`)
      }
      const newCommit = await newCommitResponse.json()

      // 6. Update branch ref to point to new commit
      const updateRefResponse = await fetch(
        `${this.baseUrl}/repos/${repoFullName}/git/refs/heads/${branch}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ sha: newCommit.sha })
        }
      )
      if (!updateRefResponse.ok) {
        throw new Error(`Failed to update branch ref: HTTP ${updateRefResponse.status}`)
      }

      return {
        success: true,
        commitSha: newCommit.sha,
        filesCreated: treeItems.map(t => t.path),
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
