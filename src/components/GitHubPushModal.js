import React, { useState, useEffect } from 'react';
import { X, Github, ExternalLink, AlertCircle, Check, Loader2, RefreshCw } from 'lucide-react';
import { gitHubService } from '../services/GitHubService';
import { debugLog, debugError } from '../utils/debugUtils';

const GitHubPushModal = ({
  isOpen,
  onClose,
  extension,
  files
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [gitHubUser, setGitHubUser] = useState(null);

  // Check connection status and load repos when modal opens
  useEffect(() => {
    if (isOpen) {
      checkConnectionAndLoadRepos();
      // Set default commit message
      if (extension?.name) {
        setCommitMessage(`Add ${extension.name} extension`);
      }
    }
  }, [isOpen, extension]);

  const checkConnectionAndLoadRepos = async () => {
    setIsLoading(true);
    setError('');

    try {
      const connected = await gitHubService.isGitHubConnected();
      setIsConnected(connected);

      if (connected) {
        // Load user info and repositories
        const [user, repos] = await Promise.all([
          gitHubService.getGitHubUser(),
          gitHubService.getRepositories()
        ]);

        setGitHubUser(user);
        setRepositories(repos);
        debugLog('Loaded GitHub data:', { user: user?.login, repoCount: repos.length });
      }
    } catch (err) {
      debugError('Error checking GitHub connection:', err);
      if (err.message?.includes('expired')) {
        setIsConnected(false);
        setError('GitHub connection expired. Please reconnect.');
      } else {
        setError(err.message || 'Failed to load GitHub data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setError('');
    try {
      await gitHubService.connectGitHub();
      // OAuth will redirect, so we don't need to do anything else here
    } catch (err) {
      debugError('GitHub connect error:', err);
      setError(err.message || 'Failed to connect to GitHub');
    }
  };

  const handlePush = async () => {
    if (!selectedRepo || !commitMessage.trim()) {
      setError('Please select a repository and enter a commit message');
      return;
    }

    const extensionFiles = files || extension?.files;
    if (!extensionFiles || Object.keys(extensionFiles).length === 0) {
      setError('No files to push');
      return;
    }

    setIsPushing(true);
    setError('');

    try {
      const result = await gitHubService.pushFiles(
        extensionFiles,
        selectedRepo,
        commitMessage.trim()
      );

      setSuccess(result);
      debugLog('Successfully pushed to GitHub:', result);
    } catch (err) {
      debugError('Push error:', err);
      setError(err.message || 'Failed to push to GitHub');
    } finally {
      setIsPushing(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setError('');
    setSuccess(null);
    setSelectedRepo('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-lg border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-800">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Push to GitHub</h2>
              <p className="text-gray-400 text-sm">
                {extension?.name ? `Push "${extension.name}" to a repository` : 'Push extension to GitHub'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-lime-400 animate-spin mb-4" />
              <p className="text-gray-400">Checking GitHub connection...</p>
            </div>
          )}

          {/* Success State */}
          {!isLoading && success && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Successfully Pushed!</h3>
              <p className="text-gray-400 mb-6">
                {success.filesCreated?.length || 0} file(s) pushed to your repository
              </p>
              {success.filesFailed?.length > 0 && (
                <p className="text-yellow-400 text-sm mb-4">
                  {success.filesFailed.length} file(s) failed to push
                </p>
              )}
              <a
                href={success.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-lime-400 hover:bg-lime-500 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Repository
              </a>
            </div>
          )}

          {/* Not Connected State */}
          {!isLoading && !success && !isConnected && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Github className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connect Your GitHub Account</h3>
              <p className="text-gray-400 mb-6">
                Link your GitHub account to push extensions directly to your repositories
              </p>
              <button
                onClick={handleConnect}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <Github className="w-5 h-5" />
                Connect with GitHub
              </button>
            </div>
          )}

          {/* Connected State - Repository Selection */}
          {!isLoading && !success && isConnected && (
            <div className="space-y-6">
              {/* Connected User Info */}
              {gitHubUser && (
                <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    {gitHubUser.avatar_url && (
                      <img
                        src={gitHubUser.avatar_url}
                        alt={gitHubUser.login}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-white font-medium">{gitHubUser.login}</p>
                      <p className="text-gray-400 text-sm">Connected to GitHub</p>
                    </div>
                  </div>
                  <button
                    onClick={checkConnectionAndLoadRepos}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                    title="Refresh repositories"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Repository Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Repository
                </label>
                <select
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  disabled={isPushing}
                >
                  <option value="">Select a repository...</option>
                  {repositories.map((repo) => (
                    <option key={repo.id} value={repo.fullName}>
                      {repo.fullName} {repo.private ? '(Private)' : ''}
                    </option>
                  ))}
                </select>
                {repositories.length === 0 && (
                  <p className="text-gray-500 text-sm mt-2">
                    No repositories found with push access
                  </p>
                )}
              </div>

              {/* Commit Message */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Commit Message
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Add extension files"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  disabled={isPushing}
                  maxLength={100}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPushing}
                  className="px-6 py-2 text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePush}
                  disabled={isPushing || !selectedRepo || !commitMessage.trim()}
                  className="px-6 py-2 bg-lime-400 hover:bg-lime-500 text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isPushing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Pushing...
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      Push to GitHub
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error when not connected */}
          {!isLoading && !isConnected && error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg mt-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubPushModal;
