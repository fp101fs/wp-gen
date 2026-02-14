import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { useTokenContext } from './contexts/TokenContext';
import { debugLog } from './utils/debugUtils';

function RevisionModal({ extension, onClose, onGenerateRevision }) {
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [selectedLLM, setSelectedLLM] = useState('gemini-3-flash');
  const { currentTokens, isUnlimited, showUpgradePromptAction } = useTokenContext();

  const handleSubmit = () => {
    if (!revisionPrompt.trim()) return;

    // Credit costs proportional to API pricing (Flash=1, Pro=15, Sonnet=50, Opus=240)
    const requiredTokens = selectedLLM === 'claude-opus-4-6' ? 240 : selectedLLM === 'claude-sonnet-4-5' ? 50 : selectedLLM === 'gemini-3-pro' ? 15 : 1;
    if (!isUnlimited && currentTokens < requiredTokens) {
      showUpgradePromptAction(`Need ${requiredTokens} credit${requiredTokens > 1 ? 's' : ''} to revise extension`);
      return;
    }
    
    onGenerateRevision(revisionPrompt, extension, selectedLLM);
  };

  if (!extension) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-950 rounded-lg p-8 max-w-2xl w-full relative border border-white/10 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-white mb-4 text-center">Revise Extension</h2>
        <p className="text-center text-gray-400 mb-8">Revising: <strong>{extension.name} (v{extension.version})</strong></p>
        
        <textarea
          className="w-full h-32 bg-neutral-900 text-white placeholder-gray-400 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none text-lg border border-white/10"
          placeholder="e.g., Add a button to change the background color to blue..."
          value={revisionPrompt}
          onChange={(e) => setRevisionPrompt(e.target.value)}
        />

        <div className="mt-4 flex justify-center">
          <div className="relative inline-block text-left">
            <select
              value={selectedLLM}
              onChange={(e) => {
                setSelectedLLM(e.target.value);
                debugLog('🔄 Revision LLM changed to:', e.target.value);
              }}
              className="px-4 py-2 bg-gray-700 rounded-full text-white text-sm font-medium hover:bg-gray-600 transition-colors appearance-none focus:outline-none cursor-pointer"
            >
              <option value="gemini-3-flash">🤖 Gemini 3 Flash ⚡ 1</option>
              <option value="gemini-3-pro">🤖 Gemini 3 Pro ⚡ 15</option>
              <option value="claude-sonnet-4-5">🧠 Claude Sonnet 4.5 ⚡ 50</option>
              <option value="claude-opus-4-6">🧠 Claude Opus 4.6 ⚡ 240</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          {/* Token display */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-300 flex items-center space-x-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className={`font-semibold ${
                isUnlimited ? 'text-green-400' : 
                currentTokens === 0 ? 'text-red-400' : 
                currentTokens <= 1 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {isUnlimited ? 'unlimited' : currentTokens}
              </span>
              <span>credit{isUnlimited ? 's' : currentTokens === 1 ? '' : 's'} remaining</span>
            </span>
            {!isUnlimited && currentTokens <= 1 && (
              <button
                onClick={() => {
                  showUpgradePromptAction('Get more credits to continue creating');
                  onClose();
                }}
                className="text-blue-400 hover:text-blue-300 underline text-xs"
              >
                Get more
              </button>
            )}
          </div>
          
          {/* Generate button - Always enabled when text is entered, regardless of token count */}
          <button
            onClick={handleSubmit}
            disabled={!revisionPrompt.trim()}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 ${
              !revisionPrompt.trim()
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                : 'bg-lime-400 text-black hover:bg-lime-500 font-bold'
            }`}
          >
            Generate Revision
          </button>
        </div>
      </div>
    </div>
  );
}

export default RevisionModal;