import React from 'react';
import { X, Target, Edit3, RotateCcw, ExternalLink } from 'lucide-react';

const TipsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Chrome Extension Development Tips</h2>
              <p className="text-purple-100 text-sm">Master the art of AI-powered extension development</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Golden Rule */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                The Golden Rule: Start Simple, Refine with Revisions
              </h3>
              <p className="text-purple-800 font-medium mb-4">
                Most successful extensions are built iteratively, not all at once.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <h4 className="font-semibold text-red-800 mb-2">❌ Don't Start Like This:</h4>
                  <div className="bg-red-100 p-3 rounded text-sm text-red-700 font-mono">
                    "Create a Chrome extension with a blue button in the top right corner. The button should open a popup that shows Wikipedia analysis data including word count, reading time, and key topics. Also add settings for customizing colors and a notification system."
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Start Like This Instead:</h4>
                  <div className="space-y-2">
                    <div className="bg-green-100 p-2 rounded text-sm text-green-700 font-mono">
                      <strong>Step 1:</strong> "Make an extension that analyzes a Wikipedia page and shows word count."
                    </div>
                    <div className="text-xs text-gray-600 text-center">Generate → Test → Then revise...</div>
                    <div className="bg-blue-100 p-2 rounded text-sm text-blue-700 font-mono">
                      <strong>Step 2:</strong> "Add a blue button in the top right corner that displays this information in a popup."
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prompting Best Practices */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Edit3 className="w-5 h-5 mr-2" />
              Prompting Best Practices
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <h4 className="text-lg font-semibold text-green-700 mb-3">DO ✅</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Be specific about the core function</strong></li>
                  <li>• <strong>Mention the target website/domain</strong></li>
                  <li>• <strong>Use simple, clear language</strong></li>
                  <li>• <strong>Focus on ONE main feature initially</strong></li>
                  <li>• <strong>Specify WHERE the UI should appear</strong></li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                <h4 className="text-lg font-semibold text-red-700 mb-3">DON'T ❌</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Cram multiple features in first prompt</strong></li>
                  <li>• <strong>Over-specify visual details initially</strong></li>
                  <li>• <strong>Use technical jargon unnecessarily</strong></li>
                  <li>• <strong>Request complex integrations upfront</strong></li>
                  <li>• <strong>Assume the AI knows your preferences</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategic Revisions */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <RotateCcw className="w-5 h-5 mr-2" />
              The Power of Strategic Revisions
            </h3>

            <p className="text-gray-600 mb-4">
              Think of revisions as <strong>guided conversations</strong> with your extension. Each revision builds on what already works.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🎨 UI Improvements</h4>
                  <div className="text-sm font-mono bg-blue-100 p-2 rounded text-blue-700">
                    "Make the popup wider and add better spacing between elements"
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">⚙️ Functionality Additions</h4>
                  <div className="text-sm font-mono bg-purple-100 p-2 rounded text-purple-700">
                    "Add a settings panel where users can choose which metrics to display"
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-orange-50 border border-orange-200 rounded p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">🐛 Bug Fixes</h4>
                  <div className="text-sm font-mono bg-orange-100 p-2 rounded text-orange-700">
                    "Fix this error: [paste exact error from Chrome Extension Manager]"
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <h4 className="font-semibold text-green-800 mb-2">🚀 Feature Enhancements</h4>
                  <div className="text-sm font-mono bg-green-100 p-2 rounded text-green-700">
                    "Add keyboard shortcut (Ctrl+K) to toggle the analysis display"
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proven Patterns */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🏗️ Proven Extension Patterns</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <h4 className="font-semibold text-gray-800 mb-2">1. Content Analyzers</h4>
                <p className="text-sm text-gray-600 mb-2">Extensions that read and analyze webpage content</p>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded text-gray-700">
                  "Create an extension that counts words on any webpage"
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <h4 className="font-semibold text-gray-800 mb-2">2. Data Scrapers</h4>
                <p className="text-sm text-gray-600 mb-2">Extensions that extract specific information</p>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded text-gray-700">
                  "Make an extension that finds all email addresses on a page"
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <h4 className="font-semibold text-gray-800 mb-2">3. Productivity Helpers</h4>
                <p className="text-sm text-gray-600 mb-2">Extensions that automate repetitive tasks</p>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded text-gray-700">
                  "Create an extension that auto-fills forms with saved data"
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <h4 className="font-semibold text-gray-800 mb-2">4. Visual Enhancers</h4>
                <p className="text-sm text-gray-600 mb-2">Extensions that modify page appearance</p>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded text-gray-700">
                  "Make an extension that applies dark mode to any website"
                </div>
              </div>
            </div>
          </div>

          {/* Link to Full Article */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800 mb-2">Want more detailed tips and examples?</p>
            <a
              href="/learn/tips"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
              onClick={onClose}
            >
              Read the Complete Development Tips Guide
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipsModal;