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
   * @param {Object|null} releaseOptions - Optional release options { version, name }
   * @returns {Promise<Object>}
   */
  async pushFiles(files, repoFullName, commitMessage, branch = 'main', releaseOptions = null) {
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

      // 1. Try to get current branch ref (may not exist for empty repos)
      let currentCommitSha = null
      let baseTreeSha = null

      const refResponse = await fetch(
        `${this.baseUrl}/repos/${repoFullName}/git/ref/heads/${branch}`,
        { headers }
      )

      if (refResponse.ok) {
        // Existing repo with commits
        const refData = await refResponse.json()
        currentCommitSha = refData.object.sha

        // 2. Get base tree from current commit
        const commitResponse = await fetch(
          `${this.baseUrl}/repos/${repoFullName}/git/commits/${currentCommitSha}`,
          { headers }
        )
        if (!commitResponse.ok) {
          throw new Error(`Failed to get commit: HTTP ${commitResponse.status}`)
        }
        const commitData = await commitResponse.json()
        baseTreeSha = commitData.tree.sha
      } else if (refResponse.status !== 404 && refResponse.status !== 409) {
        // Unexpected error (not just empty repo)
        const errorData = await refResponse.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to get branch ref: HTTP ${refResponse.status}`)
      }
      // If 404 or 409, currentCommitSha and baseTreeSha remain null (empty repo)

      // For 409, verify if Git Data API works by testing blob creation
      let useContentsApiFallback = false
      if (refResponse.status === 409) {
        // Test if Git Data API works on this repo
        const testBlobResponse = await fetch(
          `${this.baseUrl}/repos/${repoFullName}/git/blobs`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ content: 'test', encoding: 'utf-8' })
          }
        )
        if (!testBlobResponse.ok) {
          // Git Data API doesn't work (404 or 409) - use Contents API fallback
          useContentsApiFallback = true
        }
      }

      if (useContentsApiFallback) {
        return this.pushFilesViaContentsApi(files, repoFullName, commitMessage, null, headers, releaseOptions)
      }

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
      const treeBody = { tree: treeItems }
      if (baseTreeSha) {
        treeBody.base_tree = baseTreeSha
      }
      const treeResponse = await fetch(
        `${this.baseUrl}/repos/${repoFullName}/git/trees`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(treeBody)
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
            parents: currentCommitSha ? [currentCommitSha] : []
          })
        }
      )
      if (!newCommitResponse.ok) {
        throw new Error(`Failed to create commit: HTTP ${newCommitResponse.status}`)
      }
      const newCommit = await newCommitResponse.json()

      // 6. Create or update branch ref
      const refMethod = currentCommitSha ? 'PATCH' : 'POST'
      const refUrl = currentCommitSha
        ? `${this.baseUrl}/repos/${repoFullName}/git/refs/heads/${branch}`
        : `${this.baseUrl}/repos/${repoFullName}/git/refs`
      const refBody = currentCommitSha
        ? { sha: newCommit.sha, force: true }
        : { ref: `refs/heads/${branch}`, sha: newCommit.sha }

      const updateRefResponse = await fetch(refUrl, {
        method: refMethod,
        headers,
        body: JSON.stringify(refBody)
      })
      if (!updateRefResponse.ok) {
        const action = currentCommitSha ? 'update' : 'create'
        throw new Error(`Failed to ${action} branch ref: HTTP ${updateRefResponse.status}`)
      }

      // Create release if requested
      let releaseUrl = null
      if (releaseOptions) {
        const tagName = `v${releaseOptions.version}`
        const releaseName = `${releaseOptions.name} v${releaseOptions.version}`
        const release = await this.createRelease(repoFullName, tagName, newCommit.sha, releaseName, commitMessage, headers)
        releaseUrl = release.html_url
      }

      return {
        success: true,
        commitSha: newCommit.sha,
        filesCreated: treeItems.map(t => t.path),
        repoUrl: `https://github.com/${repoFullName}`,
        releaseUrl
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

  /**
   * Push files using Contents API (for empty repositories where Git Data API fails)
   * Note: Creates one commit per file, so use only when Git Data API is unavailable
   * @param {Object} files - Object with filename as key, content as value
   * @param {string} repoFullName - Full repository name (owner/repo)
   * @param {string} commitMessage - Commit message
   * @param {string} branch - Branch to push to
   * @param {Object} headers - Request headers with auth token
   * @param {Object|null} releaseOptions - Optional release options { version, name }
   * @returns {Promise<Object>}
   */
  async pushFilesViaContentsApi(files, repoFullName, commitMessage, branch, headers, releaseOptions = null) {
    const filesToPush = Object.entries(files).filter(([name]) => name !== 'instructions')
    const results = []

    for (const [path, content] of filesToPush) {
      const response = await fetch(
        `${this.baseUrl}/repos/${repoFullName}/contents/${path}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: commitMessage,
            content: btoa(unescape(encodeURIComponent(content))),
            ...(branch && { branch })
          })
        }
      )
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to create ${path}: HTTP ${response.status}`)
      }
      results.push(await response.json())
    }

    const commitSha = results[results.length - 1]?.commit?.sha

    // Create release if requested
    let releaseUrl = null
    if (releaseOptions && commitSha) {
      const tagName = `v${releaseOptions.version}`
      const releaseName = `${releaseOptions.name} v${releaseOptions.version}`
      const release = await this.createRelease(repoFullName, tagName, commitSha, releaseName, commitMessage, headers)
      releaseUrl = release.html_url
    }

    return {
      success: true,
      commitSha,
      filesCreated: filesToPush.map(([path]) => path),
      repoUrl: `https://github.com/${repoFullName}`,
      releaseUrl
    }
  }

  /**
   * Create a GitHub Release
   * @param {string} repoFullName - Full repository name (owner/repo)
   * @param {string} tagName - Tag name for the release (e.g., "v1.0.0")
   * @param {string} targetCommitSha - SHA of the commit to tag
   * @param {string} name - Release name
   * @param {string} body - Release description
   * @param {Object} headers - Request headers with auth token
   * @returns {Promise<Object>}
   */
  async createRelease(repoFullName, tagName, targetCommitSha, name, body, headers) {
    const response = await fetch(
      `${this.baseUrl}/repos/${repoFullName}/releases`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tag_name: tagName,
          target_commitish: targetCommitSha,
          name: name,
          body: body,
          draft: false,
          prerelease: false
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Check for specific validation errors
      if (response.status === 422 && errorData.errors?.length > 0) {
        const error = errorData.errors[0]

        if (error.code === 'already_exists' && error.field === 'tag_name') {
          throw new Error(`Release tag "${tagName}" already exists. Please use a different version number.`)
        }

        if (error.code === 'invalid' && error.field === 'tag_name') {
          throw new Error(`Invalid tag name "${tagName}". Tag names must be valid git references.`)
        }

        // Use custom message if provided
        if (error.message) {
          throw new Error(error.message)
        }
      }

      throw new Error(errorData.message || `Failed to create release: HTTP ${response.status}`)
    }

    return response.json()
  }
}

export const gitHubService = new GitHubService()
export default gitHubService
